sap.ui.define([
    "sap/ui/core/Component"
], function (Component) {
    "use strict";

    return {
        onDashboardPress: function () {
            // Find the app component and navigate to the Dashboard route
            var oRouter = null;
            Component.registry.forEach(function (oComp) {
                if (oRouter) { return; }
                try {
                    var r = oComp.getRouter && oComp.getRouter();
                    if (r && r.getRoute && r.getRoute("Dashboard")) {
                        oRouter = r;
                    }
                } catch (e) { /* skip */ }
            });

            if (oRouter) {
                oRouter.navTo("Dashboard");
            } else {
                console.warn("[DashboardNavButton] Router or Dashboard route not found");
            }
        }
    };
});
