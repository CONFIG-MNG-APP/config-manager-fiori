sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zcaption/configfilimit/test/integration/pages/ZC_FI_LIMIT_CONFList",
	"zcaption/configfilimit/test/integration/pages/ZC_FI_LIMIT_CONFObjectPage"
], function (JourneyRunner, ZC_FI_LIMIT_CONFList, ZC_FI_LIMIT_CONFObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zcaption/configfilimit') + '/test/flp.html#app-preview',
        pages: {
			onTheZC_FI_LIMIT_CONFList: ZC_FI_LIMIT_CONFList,
			onTheZC_FI_LIMIT_CONFObjectPage: ZC_FI_LIMIT_CONFObjectPage
        },
        async: true
    });

    return runner;
});

