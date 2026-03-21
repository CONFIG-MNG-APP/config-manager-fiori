sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zcapstone/configreqmanager/test/integration/pages/ZC_CONF_REQ_HList",
	"zcapstone/configreqmanager/test/integration/pages/ZC_CONF_REQ_HObjectPage",
	"zcapstone/configreqmanager/test/integration/pages/ZC_CONF_REQ_IObjectPage"
], function (JourneyRunner, ZC_CONF_REQ_HList, ZC_CONF_REQ_HObjectPage, ZC_CONF_REQ_IObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zcapstone/configreqmanager') + '/test/flp.html#app-preview',
        pages: {
			onTheZC_CONF_REQ_HList: ZC_CONF_REQ_HList,
			onTheZC_CONF_REQ_HObjectPage: ZC_CONF_REQ_HObjectPage,
			onTheZC_CONF_REQ_IObjectPage: ZC_CONF_REQ_IObjectPage
        },
        async: true
    });

    return runner;
});

