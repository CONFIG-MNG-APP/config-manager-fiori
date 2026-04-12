sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {
        onAuditTrailPress: function (oEvent) {
            try {
                var oBindingContext = oEvent.getSource().getBindingContext();
                if (!oBindingContext) {
                    MessageToast.show("Không lấy được context của request.");
                    return;
                }

                var sReqId = oBindingContext.getProperty("ReqId");
                if (!sReqId) {
                    MessageToast.show("ReqId không tồn tại.");
                    return;
                }

                console.log("[AuditTrail] Navigating with ReqId:", sReqId);

                if (!sap.ushell || !sap.ushell.Container) {
                    // Local dev fallback: open in new tab without FLP shell
                    var sUrl = "../audittrailformanager/webapp/index.html?ReqId=" + encodeURIComponent(sReqId);
                    window.open(sUrl, "_blank");
                    return;
                }

                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                oCrossAppNavigator.toExternal({
                    target: {
                        semanticObject: "AuditTrail",
                        action: "display"
                    },
                    params: {
                        ReqId: sReqId
                    },
                    writeHistory: true
                });

            } catch (e) {
                console.error("Error in onAuditTrailPress:", e);
                MessageToast.show("Lỗi khi mở Audit Trail: " + e.message);
            }
        }
    };
});
