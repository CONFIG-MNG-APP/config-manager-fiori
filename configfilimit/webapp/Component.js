sap.ui.define(
    [
        "sap/fe/core/AppComponent",
        "sap/ui/core/Element",
        "sap/ui/mdc/condition/Condition"
    ],
    function (AppComponent, Element, Condition) {
        "use strict";

        return AppComponent.extend("zcaption.configfilimit.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                AppComponent.prototype.init.apply(this, arguments);

                var sReqId, sConfId;
                var oComponentData = this.getComponentData();

                if (oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["ReqId"]) {
                    // FLP context: read from startup parameters
                    sReqId = oComponentData.startupParameters["ReqId"][0];
                    sConfId = oComponentData.startupParameters["ConfId"] && oComponentData.startupParameters["ConfId"][0];
                } else {
                    // Standalone BSP context: read from URL query string
                    // SAP ICM có thể lowercase tất cả query params — đọc cả hai dạng
                    var oParams = new URLSearchParams(window.location.search);
                    sReqId  = oParams.get("ReqId")  || oParams.get("reqid");
                    sConfId = oParams.get("ConfId") || oParams.get("confid");
                }

                if (!sReqId && !sConfId) { return; }
                this._applyCompareFilter(sReqId, sConfId);
            },

            _applyCompareFilter: function (sReqId, sConfId) {
                var oRouter = this.getRouter();
                var bApplied = false;

                var fnOnRoute = function () {
                    if (bApplied) { return; }
                    bApplied = true;
                    oRouter.detachRoutePatternMatched(fnOnRoute);

                    var iAttempt = 0;
                    var oFilterBar = null;

                    var iInterval = setInterval(function () {
                        iAttempt++;

                        if (!oFilterBar) {
                            Element.registry.forEach(function (oEl) {
                                if (!oFilterBar && oEl.isA && oEl.isA("sap.ui.mdc.FilterBar")) {
                                    oFilterBar = oEl;
                                }
                            });
                        }

                        if (!oFilterBar) {
                            if (iAttempt >= 200) {
                                clearInterval(iInterval);
                                console.warn("[FILimit] FilterBar not found after 20s");
                            }
                            return;
                        }

                        // FilterBar found — use waitForInitialization() so all
                        // filter fields (incl. hidden ReqId/ConfId) are registered
                        // before we set conditions. This avoids the race condition
                        // where the condition model exists but fields aren't typed yet.
                        clearInterval(iInterval);

                        var oConditions = {};
                        if (sReqId)  { oConditions["ReqId"]  = [Condition.createCondition("EQ", [sReqId])]; }
                        if (sConfId) { oConditions["ConfId"] = [Condition.createCondition("EQ", [sConfId])]; }

                        var iRetry = 0;
                        var fnApply = function () {
                            try {
                                if (typeof oFilterBar.setFilterConditions === "function") {
                                    oFilterBar.setFilterConditions(oConditions);
                                    oFilterBar.triggerSearch();
                                    console.log("[FILimit] Filters applied via setFilterConditions — ReqId:", sReqId, "ConfId:", sConfId);
                                    return;
                                }
                                var oConditionModel = oFilterBar.getModel("$filters");
                                if (!oConditionModel) {
                                    if (iRetry++ < 20) {
                                        setTimeout(fnApply, 300);
                                    } else {
                                        console.warn("[FILimit] $filters model not available after retries");
                                    }
                                    return;
                                }
                                oConditionModel.setConditions(oConditions);
                                oFilterBar.triggerSearch();
                                console.log("[FILimit] Filters applied via $filters model — ReqId:", sReqId, "ConfId:", sConfId);
                            } catch (e) {
                                console.error("[FILimit] Error applying filter:", e);
                            }
                        };

                        if (typeof oFilterBar.waitForInitialization === "function") {
                            oFilterBar.waitForInitialization().then(fnApply);
                        } else {
                            // Fallback for older UI5 builds
                            setTimeout(fnApply, 1000);
                        }

                    }, 100);
                };

                oRouter.attachRoutePatternMatched(fnOnRoute);
            }
        });
    }
);
