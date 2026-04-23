sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zcapstion.configmmsafestock',
            componentId: 'MMSafeStockList',
            contextPath: '/MMSafeStock'
        },
        CustomPageDefinitions
    );
});