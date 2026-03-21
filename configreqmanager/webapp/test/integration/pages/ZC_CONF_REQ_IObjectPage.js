sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zcapstone.configreqmanager',
            componentId: 'ZC_CONF_REQ_IObjectPage',
            contextPath: '/ZC_CONF_REQ_H/_Items'
        },
        CustomPageDefinitions
    );
});