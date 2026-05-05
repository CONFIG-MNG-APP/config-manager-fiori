sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    var _BSP_MAP = {
        "FILimit":     "zconfigfi_limit",
        "SDPrice":     "zconfigsd_price",
        "MMRoute":     "zconfigmm_route",
        "MMSafeStock": "zconfigmm_stock"
    };

    function _resolveSemanticObject(sModuleId, sTargetCds) {
        var sCds = (sTargetCds || "").toUpperCase();
        if (sModuleId === "FI" || sCds.indexOf("FILIMIT") > -1) {
            return "FILimit";
        }
        if (sModuleId === "SD" || sCds.indexOf("PRICE") > -1) {
            return "SDPrice";
        }
        if (sModuleId === "MM") {
            if (sCds.indexOf("ROUTE") > -1)                          { return "MMRoute"; }
            if (sCds.indexOf("SAFE") > -1 || sCds.indexOf("STOCK") > -1) { return "MMSafeStock"; }
            // TargetCds không khớp pattern đã biết — báo lỗi rõ ràng thay vì navigate sai
            return null;
        }
        return null;
    }

    return {
        onComparePress: function(oEvent) {
            console.log("[CompareButton v4]");
            try {
                var oItemCtx = oEvent.getSource().getBindingContext();
                if (!oItemCtx) {
                    console.error("Item binding context is undefined");
                    return;
                }
                var oHeaderCtx = oItemCtx.getBinding().getContext();
                if (!oHeaderCtx) {
                    console.error("Header binding context is undefined");
                    return;
                }

                // Dùng requestProperty cho tất cả — đảm bảo luôn có giá trị dù FE chưa $select sẵn
                Promise.all([
                    oItemCtx.requestProperty("ConfId"),
                    oHeaderCtx.requestProperty("TargetCds"),
                    oHeaderCtx.requestProperty("ModuleId"),
                    oHeaderCtx.requestProperty("ReqId")
                ]).then(function(aRes) {
                    var sConfId    = aRes[0];
                    var sTargetCds = aRes[1] || "";
                    var sModuleId  = aRes[2];
                    var sReqId     = aRes[3];

                    console.log("ModuleId:", sModuleId, "TargetCds:", sTargetCds, "ReqId:", sReqId, "ConfId:", sConfId);

                    var sSemanticObject = _resolveSemanticObject(sModuleId, sTargetCds);
                    if (!sSemanticObject) {
                        MessageToast.show(
                            "Không xác định được ứng dụng so sánh cho module " + sModuleId +
                            (sTargetCds ? " (TargetCds: " + sTargetCds + ")" : "")
                        );
                        return;
                    }

                    console.log("Navigating to:", sSemanticObject + "-review");

                    var sBspApp = _BSP_MAP[sSemanticObject];
                    var fnOpenBsp = function() {
                        var sUrl = window.location.origin
                            + "/sap/bc/ui5_ui5/sap/" + sBspApp
                            + "?sap-client=324"
                            + "&ReqId="  + encodeURIComponent(sReqId)
                            + "&ConfId=" + encodeURIComponent(sConfId);
                        window.open(sUrl, "_blank");
                    };

                    var oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
                    if (oCrossAppNav) {
                        oCrossAppNav.toExternal({
                            target: { semanticObject: sSemanticObject, action: "review" },
                            params: { ReqId: sReqId, ConfId: sConfId }
                        });
                    } else {
                        // Môi trường không có FLP (ví dụ chạy local hoặc test độc lập)
                        fnOpenBsp();
                    }
                }).catch(function(oErr) {
                    console.error("Compare navigation error:", oErr);
                    MessageToast.show("Lỗi khi mở màn hình so sánh: " + oErr.message);
                });
            } catch (e) {
                console.error("Compare unexpected error:", e);
                MessageToast.show("Lỗi không xác định: " + e.message);
            }
        }
    };
});
