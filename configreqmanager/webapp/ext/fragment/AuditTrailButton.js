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

                var bNavigated = false;
                if (sap.ushell && sap.ushell.Container) {
                    try {
                        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                        if (oCrossAppNavigator) {
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
                            bNavigated = true;
                        }
                    } catch (oNavError) {
                        console.warn("Lỗi khi navigate AuditTrail (sẽ dùng URL fallback):", oNavError);
                    }
                }

                if (!bNavigated) {
                    // Fallback khi không thể navigate bằng FLP tiêu chuẩn
                    var sUrl = window.location.origin
                        + "/sap/bc/ui5_ui5/sap/zaudittrail_mgr"
                        + "?sap-client=324"
                        + "&ReqId=" + encodeURIComponent(sReqId);
                    window.open(sUrl, "_blank");
                }

            } catch (e) {
                console.error("Error in onAuditTrailPress:", e);
                MessageToast.show("Lỗi khi mở Audit Trail: " + e.message);
            }
        }
    };
});
