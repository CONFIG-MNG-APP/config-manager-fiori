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

            // ── Set IllustratedMessage as the no-data content for MDC Table ──
            _setupTableEmptyState: function () {
                if (this._bNoDataDone) { return; }

                var oView = this.base.getView();
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
            },

            // ── FE V4 lifecycle overrides ────────────────────────────────────────
            override: {
                onInit: function () {
                    var oView = this.base.getView();

                    // Inject custom empty state after the view renders; retry a few times
                    // in case the MDC table is not yet instantiated on first pass.
                    var that  = this;
                    var iTry  = 0;
                    var retry = function () {
                        that._setupTableEmptyState();
                        if (!that._bNoDataDone && iTry++ < 8) { setTimeout(retry, 350); }
                    };

                    oView.addEventDelegate({ onAfterRendering: function () { retry(); } });
                }
            }
        }
    );
});
