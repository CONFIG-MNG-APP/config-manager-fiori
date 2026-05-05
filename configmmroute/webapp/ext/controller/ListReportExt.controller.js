sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/mdc/condition/Condition"
], function (ControllerExtension, Condition) {
    "use strict";

    return ControllerExtension.extend("zcapstone.configmmroute.ext.controller.ListReportExt", {

        override: {
            onAfterRendering: function () {
                if (this._startupFiltersApplied) { return; }
                this._startupFiltersApplied = true;

                var sReqId  = this._getStartupParam("ReqId");
                var sConfId = this._getStartupParam("ConfId");
                if (!sReqId && !sConfId) { return; }

                var oView = this.base.getView();
                var oFilterBar = this._findFilterBar(oView);
                if (!oFilterBar) {
                    console.warn("[MMRoute] FilterBar not found");
                    return;
                }

                oFilterBar.waitForInitialization().then(function () {
                    var oConditionModel = oFilterBar.getModel("$filters");
                    if (!oConditionModel) {
                        console.warn("[MMRoute] $filters model not ready");
                        return;
                    }
                    if (sReqId) {
                        oConditionModel.addCondition("ReqId",  Condition.createCondition("EQ", [sReqId]));
                    }
                    if (sConfId) {
                        oConditionModel.addCondition("ConfId", Condition.createCondition("EQ", [sConfId]));
                    }
                    oFilterBar.triggerSearch();
                    console.log("[MMRoute] Startup filters applied — ReqId:", sReqId, "ConfId:", sConfId);
                });
            }
        },

        _getStartupParam: function (sKey) {
            var oData = this.base.getAppComponent().getComponentData();
            if (oData && oData.startupParameters && oData.startupParameters[sKey]) {
                return oData.startupParameters[sKey][0];
            }
            // SAP ICM lowercases all query params — check both casings
            var oParams = new URLSearchParams(window.location.search);
            return oParams.get(sKey) || oParams.get(sKey.toLowerCase());
        },

        _findFilterBar: function (oView) {
            var oResult = null;
            oView.findElements(true, function (oEl) {
                if (!oResult && oEl.isA("sap.ui.mdc.FilterBar")) {
                    oResult = oEl;
                }
            });
            return oResult;
        }
    });
});
