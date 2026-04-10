sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    // ============================================================
    // ObjectPage Controller Extension for config-manager-fiori
    //
    // Intercepts approve/reject bound actions to send email
    // notification via external mail-service on Render.com.
    //
    // Strategy: Listen to OData V4 model's "requestCompleted" event.
    // When a POST to .../approve or .../reject succeeds, read the
    // current binding context data and fire notification.
    //
    // Does NOT modify any existing logic; failures silently ignored.
    // ============================================================

    var _MAIL_SERVICE_URL = "https://abap19-mail-206.onrender.com/api/notify";
    var _MAIL_SERVICE_KEY = "abap19-mail-secret-key-change-me";

    function _sendMailNotification(oPayload) {
        try {
            fetch(_MAIL_SERVICE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": _MAIL_SERVICE_KEY
                },
                body: JSON.stringify(oPayload || {})
            }).catch(function () { /* silently ignore */ });
        } catch (e) { /* silently ignore */ }
    }

    function _getCurrentUser() {
        try {
            if (sap && sap.ushell && sap.ushell.Container) {
                var oService = sap.ushell.Container.getService("UserInfo");
                if (oService && oService.getUser) {
                    return oService.getUser().getId() || "unknown";
                }
            }
        } catch (e) { /* ignore */ }
        return "unknown";
    }

    // Parse URL to detect which action was called.
    // Returns "APPROVED", "REJECTED", or null.
    function _detectActionFromUrl(sUrl) {
        if (!sUrl || typeof sUrl !== "string") return null;
        var sLower = sUrl.toLowerCase();
        if (sLower.indexOf("/approve") !== -1 || sLower.indexOf(".approve") !== -1) {
            return "APPROVED";
        }
        if (sLower.indexOf("/reject") !== -1 || sLower.indexOf(".reject") !== -1) {
            return "REJECTED";
        }
        return null;
    }

    return ControllerExtension.extend(
        "zcapstone.configreqmanager.ext.controller.ObjectPageExtension",
        {
            override: {
                onInit: function () {
                    try {
                        this._attachRequestListener();
                    } catch (e) {
                        console.warn("[ObjectPageExt] Failed to attach listener:", e);
                    }
                }
            },

            // Attach listener to OData V4 model's requestCompleted event.
            // Fires for EVERY completed request; we filter by URL.
            _attachRequestListener: function () {
                var oView = this.base.getView();
                if (!oView) return;

                var oModel = oView.getModel();
                if (!oModel || !oModel.attachEvent) return;

                var that = this;

                // OData V4 model fires "requestCompleted" with parameters:
                //   url, method, success, cache
                oModel.attachEvent("requestCompleted", function (oEvent) {
                    try {
                        that._onRequestCompleted(oEvent);
                    } catch (e) {
                        // Never let mail notification errors break the app
                    }
                });
            },

            _onRequestCompleted: function (oEvent) {
                var mParams = oEvent.getParameters ? oEvent.getParameters() : {};
                var sUrl = mParams.url || "";
                var sMethod = (mParams.method || "").toUpperCase();
                var bSuccess = mParams.success !== false;

                // Only act on successful POST requests (bound actions)
                if (!bSuccess || sMethod !== "POST") return;

                // Detect action type from URL
                var sEvent = _detectActionFromUrl(sUrl);
                if (!sEvent) return;

                // Read current entity data from binding context
                var oView = this.base.getView();
                var oCtx = oView && oView.getBindingContext();
                if (!oCtx || !oCtx.getObject) return;

                var oData = oCtx.getObject() || {};

                // Fire-and-forget notification
                _sendMailNotification({
                    event: sEvent,
                    reqId: oData.ReqId || "",
                    reqTitle: oData.ReqTitle || oData.ReqId || "",
                    module: oData.ModuleId || "",
                    envId: oData.EnvId || "DEV",
                    reason: sEvent === "REJECTED"
                        ? (oData.Reason || oData.RejectReason || "")
                        : undefined,
                    triggeredBy: _getCurrentUser()
                });
            }
        }
    );
});
