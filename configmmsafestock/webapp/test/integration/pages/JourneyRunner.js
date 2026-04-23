sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zcapstion/configmmsafestock/test/integration/pages/MMSafeStockList",
	"zcapstion/configmmsafestock/test/integration/pages/MMSafeStockObjectPage"
], function (JourneyRunner, MMSafeStockList, MMSafeStockObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zcapstion/configmmsafestock') + '/test/flp.html#app-preview',
        pages: {
			onTheMMSafeStockList: MMSafeStockList,
			onTheMMSafeStockObjectPage: MMSafeStockObjectPage
        },
        async: true
    });

    return runner;
});

