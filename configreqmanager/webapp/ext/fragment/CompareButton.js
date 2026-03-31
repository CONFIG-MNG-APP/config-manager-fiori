sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        onComparePress: function(oEvent) {
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
                // TargetCds không tồn tại trên _Items → dùng ModuleId để route
                oBindingContext.requestProperty("ConfId").then(function(sConfId) {
                    var sTargetCds = "";

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
                    console.error("Lỗi khi requestProperty:", oError);
                    MessageToast.show("Không thể lấy dữ liệu cần thiết từ backend.");
                });
            } catch (e) {
                console.error("Error in onComparePress:", e);
                MessageToast.show("JS Error: " + e.message);
            }
        }
    };
});
