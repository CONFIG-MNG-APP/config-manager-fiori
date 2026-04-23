sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zcapstone/configsdprice/test/integration/pages/SDPriceConfList",
	"zcapstone/configsdprice/test/integration/pages/SDPriceConfObjectPage"
], function (JourneyRunner, SDPriceConfList, SDPriceConfObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zcapstone/configsdprice') + '/test/flp.html#app-preview',
        pages: {
			onTheSDPriceConfList: SDPriceConfList,
			onTheSDPriceConfObjectPage: SDPriceConfObjectPage
        },
        async: true
    });

    return runner;
});

