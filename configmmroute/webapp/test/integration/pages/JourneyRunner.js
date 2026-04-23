sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zcapstone/configmmroute/test/integration/pages/MMRouteConfList",
	"zcapstone/configmmroute/test/integration/pages/MMRouteConfObjectPage"
], function (JourneyRunner, MMRouteConfList, MMRouteConfObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zcapstone/configmmroute') + '/test/flp.html#app-preview',
        pages: {
			onTheMMRouteConfList: MMRouteConfList,
			onTheMMRouteConfObjectPage: MMRouteConfObjectPage
        },
        async: true
    });

    return runner;
});

