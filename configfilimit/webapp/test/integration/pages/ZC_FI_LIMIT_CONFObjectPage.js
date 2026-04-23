sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zcaption.configfilimit',
            componentId: 'ZC_FI_LIMIT_CONFObjectPage',
            contextPath: '/ZC_FI_LIMIT_CONF'
        },
        CustomPageDefinitions
    );
});