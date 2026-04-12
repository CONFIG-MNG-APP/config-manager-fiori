sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        onComparePress: function(oEvent) {
            console.log("[CompareButton v3 - USHELL FIX ACTIVE]");
            console.log("onComparePress triggered!");
            try {
                var oBindingContext = oEvent.getSource().getBindingContext();
                if (!oBindingContext) {
                    console.error("Binding Context is undefined");
                    return;
                }
                
                var oParentContext = oBindingContext.getBinding().getContext();
                if (!oParentContext) {
                    console.error("Parent Context is undefined");
                    return;
                }
                
                var sModuleId = oParentContext.getProperty("ModuleId");
                var sReqId = oParentContext.getProperty("ReqId");

                // ConfId thuộc _Items → dùng oBindingContext (item row)
                // TargetCds thuộc _Header → requestProperty vì không có trong $select mặc định
                Promise.all([
                    oBindingContext.requestProperty("ConfId"),
                    oParentContext.requestProperty("TargetCds")
                ]).then(function(aResults) {
                    var sConfId = aResults[0];
                    var sTargetCds = aResults[1] || "";

                    console.log("ModuleId:", sModuleId, "TargetCds:", sTargetCds);
                    console.log("ReqId:", sReqId, "ConfId:", sConfId);

                    var sSemanticObject = "";
                    var sCdsUpper = sTargetCds.toUpperCase();
                    
                    if (sModuleId === 'FI' || sCdsUpper.indexOf('FILIMIT') > -1) {
                        sSemanticObject = 'FILimit';
                    } else if (sModuleId === 'SD' || sCdsUpper.indexOf('PRICE') > -1) {
                        sSemanticObject = 'SDPrice';
                    } else if (sModuleId === 'MM') {
                        if (sCdsUpper.indexOf('ROUTE') > -1) {
                            sSemanticObject = 'MMRoute';
                        } else if (sCdsUpper.indexOf('SAFE') > -1 || sCdsUpper.indexOf('STOCK') > -1) {
                            sSemanticObject = 'MMSafeStock';
                        } else {
                            sSemanticObject = 'MMRoute'; 
                        }
                    } else {
                        MessageToast.show("Chưa hỗ trợ so sánh cho module " + sModuleId);
                        return;
                    }
                    
                    console.log("Navigating to SemanticObject:", sSemanticObject);

                    // Fallback khi không có FLP shell (truy cập trực tiếp qua BSP URL)
                    if (!sap.ushell || !sap.ushell.Container) {
                        var mBspApp = {
                            "FILimit":    "zconfigfi_limit",
                            "SDPrice":    "zconfigsd_price",
                            "MMRoute":    "zconfigmm_route",
                            "MMSafeStock": "zconfigmm_stock"
                        };
                        var sBspApp = mBspApp[sSemanticObject];
                        if (sBspApp) {
                            var sUrl = window.location.origin
                                + "/sap/bc/ui5_ui5/sap/" + sBspApp
                                + "?sap-client=324"
                                + "&ReqId=" + encodeURIComponent(sReqId)
                                + "&ConfId=" + encodeURIComponent(sConfId);
                            window.open(sUrl, "_blank");
                        } else {
                            MessageToast.show("Không hỗ trợ module " + sModuleId);
                        }
                        return;
                    }

                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                    oCrossAppNavigator.toExternal({
                        target: {
                            semanticObject: sSemanticObject,
                            action: "review"
                        },
                        params: {
                            ReqId: sReqId,
                            ConfId: sConfId
                        }
                    });
                }).catch(function(oError) {
                    console.error("Lỗi khi navigate:", oError);
                    MessageToast.show("Lỗi khi mở màn hình so sánh: " + oError.message);
                });
            } catch (e) {
                console.error("Error in onComparePress:", e);
                MessageToast.show("JS Error: " + e.message);
            }
        }
    };
});
