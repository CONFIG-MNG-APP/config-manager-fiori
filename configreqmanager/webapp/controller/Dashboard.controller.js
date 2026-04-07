sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    var _SVC = "/sap/opu/odata4/iwbep/all/srvd/sap/zsd_conf_req/0001/ZC_CONF_REQ_H";
    var _HDRS = { "Accept": "application/json;odata.metadata=minimal" };

    return Controller.extend("zcapstone.configreqmanager.controller.Dashboard", {

        // ── Lifecycle ────────────────────────────────────────────────────────
        onInit: function () {
            var oDashModel = new JSONModel({
                kpi: { total: 0, pending: 0, approved: 0, rejected: 0 },
                statusData:      [],
                moduleData:      [],
                recentRequests:  [],
                lastUpdated:     "–",
                loading:         true
            });
            this.getView().setModel(oDashModel, "dashboard");

            // Load data after view is ready
            this.getView().addEventDelegate({
                onAfterRendering: function () {
                    this._loadData();
                }.bind(this)
            });
        },

        onAfterRendering: function () {
            this._applyChartProperties();
        },

        // ── Data Loading ─────────────────────────────────────────────────────
        _loadData: function () {
            var oModel = this.getView().getModel("dashboard");
            oModel.setProperty("/loading", true);

            var enc = encodeURIComponent;

            // ─ Parallel $count requests ──────────────────────────────────────
            var aCountPromises = [
                this._count(""),
                this._count("Status eq 'SUBMITTED'"),
                this._count("Status eq 'APPROVED'"),
                this._count("Status eq 'REJECTED'"),
                this._count("ModuleId eq 'FI'"),
                this._count("ModuleId eq 'SD'"),
                this._count("ModuleId eq 'MM'")
            ];

            // ─ Recent pending requests ────────────────────────────────────────
            var sFilter = enc("IsActiveEntity eq true and Status eq 'SUBMITTED'");
            var sSelect = "ReqId,ReqTitle,ModuleId,EnvId,CreatedBy,CreatedAt";
            var sOrder  = enc("CreatedAt desc");
            var sRecentUrl = _SVC + "?$filter=" + sFilter +
                             "&$select=" + sSelect + "&$orderby=" + sOrder + "&$top=10";

            var oRecentPromise = fetch(sRecentUrl, { headers: _HDRS })
                .then(function (r) { return r.ok ? r.json() : { value: [] }; })
                .catch(function () { return { value: [] }; });

            var allPromises = aCountPromises.concat([oRecentPromise]);

            Promise.all(allPromises).then(function (aResults) {
                var iTotal    = aResults[0];
                var iPending  = aResults[1];
                var iApproved = aResults[2];
                var iRejected = aResults[3];
                var iFI       = aResults[4];
                var iSD       = aResults[5];
                var iMM       = aResults[6];
                var oRecent   = aResults[7];

                var now = new Date();
                var sTime = now.toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit", second: "2-digit"
                });

                // Set non-KPI data immediately
                oModel.setData({
                    kpi: { total: 0, pending: 0, approved: 0, rejected: 0 },
                    statusData: [
                        { status: "Pending Approval", count: iPending  },
                        { status: "Approved",         count: iApproved },
                        { status: "Rejected",         count: iRejected }
                    ],
                    moduleData: [
                        { module: "FI – Finance",   count: iFI },
                        { module: "SD – Sales",     count: iSD },
                        { module: "MM – Materials", count: iMM }
                    ],
                    recentRequests: (oRecent && oRecent.value) || [],
                    lastUpdated:    sTime,
                    loading:        false
                });

                // Animate KPI numbers from 0 → actual values
                this._animateKpis({
                    total:    iTotal,
                    pending:  iPending,
                    approved: iApproved,
                    rejected: iRejected
                });

                this._applyChartProperties();
            }.bind(this)).catch(function (e) {
                console.error("[Dashboard] _loadData failed:", e);
                oModel.setProperty("/loading", false);
            });
        },

        _count: function (sExtraFilter) {
            var sActive = "IsActiveEntity eq true";
            var sFilter = sActive + (sExtraFilter ? " and " + sExtraFilter : "");
            return fetch(_SVC + "/$count?$filter=" + encodeURIComponent(sFilter), { headers: _HDRS })
                .then(function (r) { return r.ok ? r.text() : "0"; })
                .then(function (t) { return parseInt(t, 10) || 0; })
                .catch(function ()  { return 0; });
        },

        // ── KPI Count-up Animation ───────────────────────────────────────────
        _animateKpis: function (oTargets) {
            var oModel    = this.getView().getModel("dashboard");
            var iDuration = 900; // ms
            var iStart    = Date.now();
            var that      = this;

            if (this._iAnimFrame) { cancelAnimationFrame(this._iAnimFrame); }

            var fnStep = function () {
                var fProgress = Math.min((Date.now() - iStart) / iDuration, 1);
                // Ease-out cubic for natural deceleration
                var fEased = 1 - Math.pow(1 - fProgress, 3);

                oModel.setProperty("/kpi", {
                    total:    Math.round(oTargets.total    * fEased),
                    pending:  Math.round(oTargets.pending  * fEased),
                    approved: Math.round(oTargets.approved * fEased),
                    rejected: Math.round(oTargets.rejected * fEased)
                });

                if (fProgress < 1) {
                    that._iAnimFrame = requestAnimationFrame(fnStep);
                } else {
                    oModel.setProperty("/kpi", oTargets); // exact final values
                }
            };

            requestAnimationFrame(fnStep);
        },

        // ── Chart Properties ─────────────────────────────────────────────────
        _applyChartProperties: function () {
            var oDonut  = this.byId("statusDonutChart");
            var oColumn = this.byId("moduleColumnChart");

            if (oDonut) {
                oDonut.setVizProperties({
                    title:    { visible: false },
                    legend:   { visible: true, position: "right" },
                    plotArea: {
                        dataLabel: {
                            visible: true,
                            type: "percentage",
                            formatString: "#%",
                            style: { fontWeight: "bold" }
                        },
                        // Colors map to statusData order: Pending, Approved, Rejected
                        colorPalette: ["#e76500", "#2b9c4e", "#bb0000"]
                    },
                    legend: {
                        visible: true,
                        position: "right",
                        label: { style: { fontSize: "12px" } }
                    },
                    interaction: {
                        selectability: {
                            legendSelection: true,
                            plotLassoSelection: false,
                            plotStdSelection: true
                        }
                    },
                    tooltip: {
                        visible: true,
                        formatString: "##"
                    }
                });
            }

            if (oColumn) {
                oColumn.setVizProperties({
                    title:    { visible: false },
                    legend:   { visible: false },
                    plotArea: {
                        dataLabel: {
                            visible: true,
                            style: { fontWeight: "bold", fontSize: "13px" }
                        },
                        // Each module bar gets its own color: FI=blue, SD=indigo, MM=orange
                        colorPalette: ["#0057b8", "#7b4ea6", "#e76500"]
                    },
                    categoryAxis: {
                        title:  { visible: false },
                        label:  { style: { fontSize: "12px", fontWeight: "600" } }
                    },
                    valueAxis: {
                        title:  { visible: false },
                        label:  { formatString: "##" }
                    },
                    interaction: {
                        selectability: { plotStdSelection: true }
                    }
                });
            }
        },

        // ── Formatters ───────────────────────────────────────────────────────
        formatDateTime: function (sValue) {
            if (!sValue) { return ""; }
            try {
                var oDate = new Date(sValue);
                return oDate.toLocaleString("en-US", {
                    year:   "numeric",
                    month:  "short",
                    day:    "2-digit",
                    hour:   "2-digit",
                    minute: "2-digit"
                });
            } catch (e) {
                return sValue;
            }
        },

        // ── Event Handlers ───────────────────────────────────────────────────
        onRefresh: function () {
            this._loadData();
        },

        onNavToList: function () {
            this.getOwnerComponent().getRouter().navTo("ZC_CONF_REQ_HList");
        },

        onKpiPress: function (oEvent) {
            // Navigate to list; FE filter will be applied by Component.js default
            this.onNavToList();
        },

        onRequestPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("dashboard");
            if (!oCtx) { return; }
            var sReqId = oCtx.getProperty("ReqId");
            if (!sReqId) {
                this.onNavToList();
                return;
            }
            var sKey = "ReqId=" + sReqId + ",IsActiveEntity=true";
            this.getOwnerComponent().getRouter()
                .navTo("ZC_CONF_REQ_HObjectPage", { key: sKey });
        }
    });
});
