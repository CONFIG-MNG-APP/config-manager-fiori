sap.ui.define(
    [
        "sap/fe/core/AppComponent",
        "sap/ui/core/Element",
        "sap/ui/mdc/condition/Condition"
    ],
    function (AppComponent, Element, Condition) {
        "use strict";

        return AppComponent.extend("zcapstone.configreqmanager.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                AppComponent.prototype.init.apply(this, arguments);

                sap.ui.require(
                    ["zcapstone/configreqmanager/ext/fragment/NotificationButton"],
                    function (oNotifHandler) {
                        oNotifHandler.startPolling();
                    }
                );

                this._applyDefaultFilter();

                var oComponentData = this.getComponentData();
                if (!oComponentData || !oComponentData.startupParameters) {
                    return;
                }
                var aReqId = oComponentData.startupParameters["ReqId"];
                if (!aReqId || !aReqId[0]) {
                    return;
                }
                this._navigateToRequest(aReqId[0]);
            },

            _applyDefaultFilter: function () {
                var oRouter = this.getRouter();
                var bApplied = false;

                var fnOnRoute = function () {
                    if (bApplied) { return; }
                    bApplied = true;
                    oRouter.detachRoutePatternMatched(fnOnRoute);

                    var iAttempt = 0;
                    var iInterval = setInterval(function () {
                        iAttempt++;

                        var oFilterBar = null;
                        Element.registry.forEach(function (oEl) {
                            if (!oFilterBar && oEl.isA && oEl.isA("sap.ui.mdc.FilterBar")) {
                                oFilterBar = oEl;
                            }
                        });

                        if (oFilterBar || iAttempt >= 40) {
                            clearInterval(iInterval);

                            if (!oFilterBar) {
                                console.warn("[Component] FilterBar not found after retries");
                                return;
                            }

                            console.log("[Component] FilterBar found at attempt", iAttempt);

                            try {
                                var oCondition = Condition.createCondition("EQ", ["SUBMITTED"]);

                                // UI5 1.108: dùng ConditionModel ($filters) thay vì setConditions()
                                var oConditionModel = oFilterBar.getModel("$filters");
                                if (oConditionModel && typeof oConditionModel.setConditions === "function") {
                                    oConditionModel.setConditions({ "Status": [oCondition] });
                                    console.log("[Component] setConditions via ConditionModel");
                                } else if (oConditionModel && typeof oConditionModel.addCondition === "function") {
                                    oConditionModel.addCondition("Status", oCondition);
                                    console.log("[Component] addCondition via ConditionModel");
                                } else if (typeof oFilterBar.addCondition === "function") {
                                    oFilterBar.addCondition("Status", oCondition);
                                    console.log("[Component] addCondition via FilterBar");
                                } else {
                                    console.warn("[Component] No condition API available, model:", oConditionModel);
                                }

                                oFilterBar.triggerSearch();
                                console.log("[Component] triggerSearch called");
                            } catch (e) {
                                console.error("[Component] Error applying filter:", e);
                            }
                        }
                    }, 100);
                };

                oRouter.attachRoutePatternMatched(fnOnRoute);
            },

            _navigateToRequest: function (sReqId) {
                var oRouter = this.getRouter();
                var fnOnInitialRoute = function () {
                    oRouter.detachRoutePatternMatched(fnOnInitialRoute);
                    var sKey = "ReqId=" + sReqId + ",IsActiveEntity=true";
                    oRouter.navTo("ZC_CONF_REQ_HObjectPage", { key: sKey }, true);
                };
                oRouter.attachRoutePatternMatched(fnOnInitialRoute);
            }
        });
    }
);
