sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Element",
    "sap/ui/mdc/condition/Condition"
], function (ControllerExtension, Element, Condition) {
    "use strict";

    return ControllerExtension.extend(
        "zcapstone.configreqmanager.ext.controller.ListReportExtension",
        {
            onInit: function () {
                console.log("[ListReportExt] onInit called");
                this._trySetFilter(0);
            },

            _trySetFilter: function (iAttempt) {
                var that = this;

                // Tìm FilterBar trong view hiện tại
                var oView = this.base.getView();
                var oFilterBar = null;

                if (oView) {
                    // Tìm trong aggregation tree của view
                    oView.findAggregatedObjects(true, function (oEl) {
                        if (!oFilterBar && oEl.isA && oEl.isA("sap.ui.mdc.FilterBar")) {
                            oFilterBar = oEl;
                        }
                        return false; // không dừng sớm
                    });
                }

                // Fallback: tìm trong Element registry
                if (!oFilterBar) {
                    Element.registry.forEach(function (oEl) {
                        if (!oFilterBar && oEl.isA && oEl.isA("sap.ui.mdc.FilterBar")) {
                            oFilterBar = oEl;
                        }
                    });
                }

                if (!oFilterBar) {
                    if (iAttempt < 20) {
                        setTimeout(function () { that._trySetFilter(iAttempt + 1); }, 150);
                    } else {
                        console.warn("[ListReportExt] FilterBar not found after retries");
                    }
                    return;
                }

                console.log("[ListReportExt] FilterBar found, setting Status=SUBMITTED");
                var oConditions = oFilterBar.getConditions() || {};

                if (!oConditions.Status || !oConditions.Status.length) {
                    oConditions.Status = [Condition.createCondition("EQ", ["SUBMITTED"])];
                    oFilterBar.setConditions(oConditions);
                }

                // Trigger search để áp dụng filter (bao gồm lần tải đầu tiên)
                oFilterBar.triggerSearch();
            }
        }
    );
});
