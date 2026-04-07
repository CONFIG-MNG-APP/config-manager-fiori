sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/json/JSONModel",
    "sap/m/GenericTag",
    "sap/m/ObjectNumber",
    "sap/m/HBox",
    "sap/m/IllustratedMessage",
    "sap/m/IllustratedMessageType",
    "sap/m/IllustratedMessageSize"
], function (ControllerExtension, JSONModel, GenericTag, ObjectNumber, HBox,
             IllustratedMessage, IllustratedMessageType, IllustratedMessageSize) {
    "use strict";

    var _SVC  = "/sap/opu/odata4/iwbep/all/srvd/sap/zsd_conf_req/0001/ZC_CONF_REQ_H";
    var _HDRS = { "Accept": "application/json;odata.metadata=minimal" };

    return ControllerExtension.extend(
        "zcapstone.configreqmanager.ext.controller.ListReportExtension",
        {
            // ── Custom (non-override) methods ────────────────────────────────────

            _fetchStats: function () {
                var oView  = this.base.getView();
                var oModel = oView && oView.getModel("statsModel");
                if (!oModel) { return; }

                var enc     = encodeURIComponent;
                var sActive = "IsActiveEntity eq true";
                var that    = this;

                function count(sExtra) {
                    var sFilter = sActive + (sExtra ? " and " + sExtra : "");
                    return fetch(_SVC + "/$count?$filter=" + enc(sFilter), { headers: _HDRS })
                        .then(function (r) { return r.ok ? r.text() : "0"; })
                        .then(function (t) { return parseInt(t, 10) || 0; });
                }

                oModel.setProperty("/loading", true);

                Promise.all([
                    count(""),
                    count("Status eq 'SUBMITTED'"),
                    count("Status eq 'APPROVED'"),
                    count("Status eq 'REJECTED'")
                ]).then(function (v) {
                    oModel.setData({ total: v[0], submitted: v[1], approved: v[2], rejected: v[3], loading: false });
                    that._updateStatsBar();
                }).catch(function (e) {
                    console.warn("[ListReportExt] Stats fetch failed:", e);
                    oModel.setProperty("/loading", false);
                });
            },

            // ── Build the inline stats bar (6 GenericTags in one row) ──────────
            _createStatsBar: function () {
                var oData = this.base.getView().getModel("statsModel").getData();

                var tag = function (sLabel, sVal, sStatus) {
                    return new GenericTag({
                        text:   sLabel,
                        status: sStatus,
                        design: "StatusIconHidden",
                        value:  new ObjectNumber({ number: String(sVal), state: sStatus, emphasized: true })
                    });
                };

                this._oTagTotal         = tag("Total",          oData.total     || 0, "None");
                this._oTagPending       = tag("Pending",         oData.submitted || 0, "Warning");
                this._oTagApproved      = tag("Approved",        oData.approved  || 0, "Success");
                this._oTagRejected      = tag("Rejected",        oData.rejected  || 0, "Error");
                this._oTagApprovalRate  = tag("Approval Rate",   "0%",               "Success");
                this._oTagRejectionRate = tag("Rejection Rate",  "0%",               "Error");

                this._oTagApprovalRate.addStyleClass("configreqRatePill");
                this._oTagRejectionRate.addStyleClass("configreqRatePill");

                return new HBox({
                    wrap: "Wrap",
                    alignItems: "Center",
                    items: [
                        this._oTagTotal,
                        this._oTagPending,
                        this._oTagApproved,
                        this._oTagRejected,
                        this._oTagApprovalRate,
                        this._oTagRejectionRate
                    ]
                }).addStyleClass("configreqInlineStatsBar");
            },

            _updateStatsBar: function () {
                if (!this._oTagTotal) { return; }
                var d = this.base.getView().getModel("statsModel").getData();
                this._oTagTotal.getValue().setNumber(String(d.total     || 0));
                this._oTagPending.getValue().setNumber(String(d.submitted || 0));
                this._oTagApproved.getValue().setNumber(String(d.approved  || 0));
                this._oTagRejected.getValue().setNumber(String(d.rejected  || 0));

                if (this._oTagApprovalRate) {
                    var iTotal   = d.total || 1;
                    var fApprPct = Math.round((d.approved / iTotal) * 100);
                    var fRejPct  = Math.round((d.rejected / iTotal) * 100);
                    this._oTagApprovalRate.getValue().setNumber(fApprPct + "%");
                    this._oTagRejectionRate.getValue().setNumber(fRejPct + "%");
                }
            },

            // ── Inject stats bar into DynamicPageHeader (above the filter bar) ──
            _injectStatsBar: function () {
                if (this._bStatsBarDone) { return; }

                var oView = this.base.getView();

                // Set IllustratedMessage as the no-data content for MDC Table
                if (!this._bNoDataDone) {
                    var oTable = null;
                    oView.findAggregatedObjects(true, function (oEl) {
                        if (!oTable && oEl.isA && oEl.isA("sap.ui.mdc.Table")) { oTable = oEl; }
                    });
                    if (oTable && oTable.setNoData) {
                        oTable.setNoData(new IllustratedMessage({
                            illustrationType: IllustratedMessageType.NoSearchResults,
                            illustrationSize: IllustratedMessageSize.Spot,
                            title: "No Requests Found",
                            description: "Try adjusting your filter criteria or switching tabs."
                        }));
                        this._bNoDataDone = true;
                    }
                }

                // Find DynamicPageHeader — contains the FilterBar
                var oDynHeader = null;
                oView.findAggregatedObjects(true, function (oEl) {
                    if (!oDynHeader && oEl.isA && oEl.isA("sap.f.DynamicPageHeader")) {
                        oDynHeader = oEl;
                    }
                });

                if (!oDynHeader) { return; }

                // Insert stats bar as the FIRST item in the header (above the FilterBar)
                oDynHeader.insertAggregation("content", this._createStatsBar(), 0, false);
                this._bStatsBarDone = true;
            },

            // ── FE V4 lifecycle overrides ────────────────────────────────────────
            override: {
                onInit: function () {
                    var oView = this.base.getView();

                    if (!oView.getModel("statsModel")) {
                        oView.setModel(new JSONModel({
                            total: 0, submitted: 0, approved: 0, rejected: 0, loading: false
                        }), "statsModel");
                    }

                    // Inject stats bar after the view renders; retry a few times
                    // in case the MDC table is not yet instantiated on first pass.
                    var that  = this;
                    var iTry  = 0;
                    var retry = function () {
                        that._injectStatsBar();
                        if (!that._bStatsBarDone && iTry++ < 8) { setTimeout(retry, 350); }
                    };

                    oView.addEventDelegate({ onAfterRendering: function () { retry(); } });

                    this._fetchStats();
                },

                routing: {
                    onAfterBinding: function () {
                        this._fetchStats();
                    }
                }
            }
        }
    );
});
