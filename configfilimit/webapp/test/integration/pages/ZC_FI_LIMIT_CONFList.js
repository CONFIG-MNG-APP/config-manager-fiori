sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zcaption.configfilimit',
            componentId: 'ZC_FI_LIMIT_CONFList',
            contextPath: '/ZC_FI_LIMIT_CONF'
        },
        CustomPageDefinitions
    );
});