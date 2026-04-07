sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Element",
    "sap/ui/core/Component",
    "sap/m/BadgeCustomData",
    "sap/ui/core/Fragment"
], function (JSONModel, Element, Component, BadgeCustomData, Fragment) {
    "use strict";

    // ─── Singletons ─────────────────────────────────────────────────────────────
    var _oNotifModel = new JSONModel({ notifications: [], unreadCount: 0 });
    var _oDialog     = null;
    var _oLoadPromise = null;
    var _aButtonRefs = [];
    var _iTimer      = null;
    var _iFindLoader = null;
    var _POLL_MS     = 30000;
    var _SVC         = "/sap/opu/odata4/iwbep/all/srvd/sap/zsd_conf_req/0001/";
    var _SEEN_KEY    = "configreq_notif_seen";

    // ─── LocalStorage ───────────────────────────────────────────────────────────
    function _getSeenIds() {
        try { return JSON.parse(localStorage.getItem(_SEEN_KEY) || "[]"); }
        catch (e) { return []; }
    }
    function _addSeenId(sId) {
        var aIds = _getSeenIds();
        if (aIds.indexOf(sId) === -1) {
            aIds.push(sId);
            if (aIds.length > 200) { aIds = aIds.slice(-200); }
            localStorage.setItem(_SEEN_KEY, JSON.stringify(aIds));
        }
    }

    // ─── Relative time ──────────────────────────────────────────────────────────
    function _relativeTime(sTs) {
        if (!sTs) { return ""; }
        var iDiff = Math.floor((Date.now() - new Date(sTs).getTime()) / 1000);
        if (iDiff < 60)    { return "Vừa xong"; }
        if (iDiff < 3600)  { return Math.floor(iDiff / 60)   + " phút trước"; }
        if (iDiff < 86400) { return Math.floor(iDiff / 3600) + " giờ trước"; }
        return Math.floor(iDiff / 86400) + " ngày trước";
    }

    // ─── Tìm button trong toolbar để gắn badge ──────────────────────────────────
    function _findButtons() {
        _aButtonRefs = [];
        Element.registry.forEach(function (oEl) {
            if (oEl.isA && oEl.isA("sap.m.Button")) {
                var sIcon = oEl.getIcon ? oEl.getIcon() : "";
                var sId = oEl.getId ? oEl.getId() : "";
                if (sIcon === "sap-icon://bell" || sId.indexOf("NotificationButton") > -1) {
                    oEl.setIcon("sap-icon://bell");
                    oEl.setText("");
                    oEl.setType("Transparent");
                    oEl.addStyleClass("configreqNotifBtn");
                    _aButtonRefs.push(oEl);
                }
            }
        });
        _updateBadge(_oNotifModel.getProperty("/unreadCount"));
    }

    // ─── Badge trên button ───────────────────────────────────────────────────────
    function _updateBadge(iUnread) {
        _aButtonRefs.forEach(function (oBtn) {
            oBtn.getCustomData()
                .filter(function (cd) { return cd.isA("sap.m.BadgeCustomData"); })
                .forEach(function (cd) { oBtn.removeCustomData(cd); cd.destroy(); });
            if (iUnread > 0) {
                oBtn.addCustomData(new BadgeCustomData({ value: " " }));
            }
        });
    }

    // ─── Refresh count + badge ───────────────────────────────────────────────────
    function _refreshCount() {
        var iUnread = _oNotifModel.getProperty("/notifications")
            .filter(function (n) { return !n.read; }).length;
        _oNotifModel.setProperty("/unreadCount", iUnread);
        _findButtons();
    }

    // ─── Navigate — discover key fields từ OData V4 meta model thực của server ──
    function _navigateToRequest(sReqId) {
        var oRouter = null, oModel = null;
        Component.registry.forEach(function (oComp) {
            if (oRouter) { return; }
            try {
                var r = oComp.getRouter && oComp.getRouter();
                if (r && r.getRoute && r.getRoute("ZC_CONF_REQ_HObjectPage")) {
                    oRouter = r;
                    oModel  = oComp.getModel && oComp.getModel();
                }
            } catch (e) { /* skip */ }
        });
        if (!oRouter) { console.warn("[Notification] Router not found"); return; }

        // Lấy danh sách key fields từ OData V4 meta model (đã load từ server thực)
        var oMetaModel = oModel && oModel.getMetaModel && oModel.getMetaModel();
        if (!oMetaModel) {
            oRouter.navTo("ZC_CONF_REQ_HObjectPage",
                { key: "ReqId=" + sReqId + ",IsActiveEntity=true" }, false);
            return;
        }

        oMetaModel.requestObject("/ZC_CONF_REQ_H/$Type/$Key").then(function (aKeys) {
            if (!Array.isArray(aKeys) || aKeys.length < 3) {
                // Fallback nếu meta model trả về ít hơn 3 keys
                oRouter.navTo("ZC_CONF_REQ_HObjectPage",
                    { key: "ReqId=" + sReqId + ",IsActiveEntity=true" }, false);
                return;
            }
            console.log("[Notification] Key fields (server meta):", aKeys);

            // Fetch entity với đúng các key fields cần thiết
            var sSelect  = aKeys.join(",");
            var sFilter  = encodeURIComponent("ReqId eq " + sReqId + " and IsActiveEntity eq true");
            var sUrl     = _SVC + "ZC_CONF_REQ_H?$filter=" + sFilter +
                           "&$select=" + sSelect + "&$top=1";

            fetch(sUrl, { headers: { "Accept": "application/json;odata.metadata=minimal" } })
                .then(function (res) { return res.ok ? res.json() : null; })
                .then(function (data) {
                    var oItem = data && data.value && data.value[0];
                    if (!oItem) {
                        console.warn("[Notification] Entity not found for ReqId:", sReqId);
                        return;
                    }
                    // Build key string với đúng types (Guid không cần quotes, String cần)
                    var sKey = aKeys.map(function (sField) {
                        var v = oItem[sField];
                        if (v === null || v === undefined) { v = ""; }
                        if (typeof v === "boolean") { return sField + "=" + v; }
                        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v))) {
                            return sField + "=" + v;  // Edm.Guid — không quotes
                        }
                        return sField + "='" + v + "'";  // Edm.String — có quotes
                    }).join(",");
                    console.log("[Notification] navTo key:", sKey);
                    oRouter.navTo("ZC_CONF_REQ_HObjectPage", { key: sKey }, false);
                })
                .catch(function (e) { console.error("[Notification] fetch key error:", e); });
        }).catch(function () {
            oRouter.navTo("ZC_CONF_REQ_HObjectPage",
                { key: "ReqId=" + sReqId + ",IsActiveEntity=true" }, false);
        });
    }

    // ─── Tạo Dialog notification — load fragment ─────
    function _buildDialog() {
        if (_oLoadPromise) { return _oLoadPromise; }
        
        _oLoadPromise = Fragment.load({
            name: "zcapstone.configreqmanager.ext.fragment.NotificationPopover",
            controller: oModule
        }).then(function (oPopover) {
            _oDialog = oPopover;
            _oDialog.setModel(_oNotifModel, "notification");
            
            _oNotifModel.attachPropertyChange(function () {
                if (!_oDialog) { return; }
                var iUnread = _oNotifModel.getProperty("/unreadCount");
                _oDialog.setTitle("Thông báo" + (iUnread > 0 ? " (" + iUnread + " chưa đọc)" : ""));
            });

            console.log("[Notification] Fragment loaded OK");
            return _oDialog;
        }).catch(function (e) {
            console.error("[Notification] _buildDialog FAILED:", e);
            _oDialog = null;
        });

        return _oLoadPromise;
    }

    // ─── Trích key từ @odata.id do server trả về (đảm bảo đủ tất cả key fields) ─
    function _extractEntityKey(sOdataId) {
        if (!sOdataId) { return ""; }
        var iOpen  = sOdataId.lastIndexOf("(");
        var iClose = sOdataId.lastIndexOf(")");
        return (iOpen > -1 && iClose > iOpen) ? sOdataId.substring(iOpen + 1, iClose) : "";
    }

    // ─── OData polling ──────────────────────────────────────────────────────────
    function _poll() {
        var sFilter = "Status eq 'SUBMITTED' and IsActiveEntity eq true";
        var sUrl = _SVC + "ZC_CONF_REQ_H?" + [
            "$filter="  + encodeURIComponent(sFilter),
            "$select=ReqId,ReqTitle,CreatedBy,ChangedAt,ModuleId,Status",
            "$orderby=" + encodeURIComponent("ChangedAt desc"),
            "$top=20"
        ].join("&");

        // metadata=minimal đảm bảo response bao gồm @odata.id với đầy đủ key fields
        fetch(sUrl, { headers: { "Accept": "application/json;odata.metadata=minimal" } })
            .then(function (res) {
                if (!res.ok) { return { value: [] }; }
                return res.json();
            })
            .then(function (data) {
                if (!data || !Array.isArray(data.value)) { return; }

                var aSeenIds    = _getSeenIds();
                var aCurrentIds = _oNotifModel.getProperty("/notifications")
                    .map(function (n) { return n.notifId; });

                var aNew = data.value
                    .filter(function (item) {
                        return aSeenIds.indexOf(item.ReqId) === -1 &&
                               aCurrentIds.indexOf(item.ReqId) === -1;
                    })
                    .map(function (item) {
                        // Lấy entity key đầy đủ từ @odata.id (bao gồm DraftUUID hoặc các key khác)
                        var sEntityKey = _extractEntityKey(item["@odata.id"]);
                        return {
                            notifId:     item.ReqId,
                            title:       item.ReqTitle || "(Chưa có tiêu đề)",
                            description: "Cần phê duyệt – " + (item.CreatedBy || "") +
                                         " [" + (item.ModuleId || "") + "]",
                            reqId:       item.ReqId,
                            entityKey:   sEntityKey,   // ← key đầy đủ để navigate
                            createdBy:   item.CreatedBy || "",
                            moduleId:    item.ModuleId  || "",
                            timestamp:   item.ChangedAt,
                            timeDisplay: _relativeTime(item.ChangedAt),
                            read:        false
                        };
                    });

                if (aNew.length === 0) { return; }
                var aCurrent = _oNotifModel.getProperty("/notifications");
                _oNotifModel.setProperty("/notifications", aNew.concat(aCurrent));
                _refreshCount();
            })
            .catch(function (e) { console.error("[Notification] fetch error:", e); });
    }

    // ─── Public API ─────────────────────────────────────────────────────────────
    var oModule = {

        startPolling: function () {
            if (_iTimer) { return; }

            // Build dialog ngay khi polling bắt đầu — KHÔNG chờ đến khi click
            _buildDialog();

            _poll();
            _iTimer = setInterval(_poll, _POLL_MS);

            _iFindLoader = setInterval(function () {
                _findButtons();
            }, 1000);
        },

        onNotificationPress: function () {
            var fnOpen = function(oDlg) {
                if (!oDlg) return;
                if (oDlg.isA("sap.m.ResponsivePopover") && _aButtonRefs[0]) {
                    oDlg.openBy(_aButtonRefs[0]);
                } else if (oDlg.open) {
                    oDlg.open();
                }
            };
            
            var p = _buildDialog();
            if (p && p.then) {
                p.then(fnOpen);
            }
        },

        onMarkAllRead: function () {
            var aNotifs = _oNotifModel.getProperty("/notifications");
            aNotifs.forEach(function (n) { n.read = true; _addSeenId(n.notifId); });
            _oNotifModel.setProperty("/notifications", aNotifs);
            _refreshCount();
        },

        onClearAll: function () {
            var aNotifs = _oNotifModel.getProperty("/notifications");
            aNotifs.forEach(function (n) { _addSeenId(n.notifId); });
            _oNotifModel.setProperty("/notifications", []);
            _refreshCount();
        },

        onNotificationItemPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("notification");
            if (!oCtx) { return; }
            var oNotif = oCtx.getObject();
            // Đánh dấu đã đọc
            oNotif.read = true;
            _addSeenId(oNotif.notifId);
            _oNotifModel.refresh(true);
            _refreshCount();
            // Đóng dialog rồi navigate nội bộ (không dùng CrossApp để tránh lỗi FLP config)
            if (_oDialog) { _oDialog.close(); }
            _navigateToRequest(oNotif.reqId);
        },

        getModel: function () { return _oNotifModel; }
    };

    return oModule;
});
