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
