sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zcapstone.configreqmanager',
            componentId: 'ZC_CONF_REQ_HList',
            contextPath: '/ZC_CONF_REQ_H'
        },
        CustomPageDefinitions
    );
});