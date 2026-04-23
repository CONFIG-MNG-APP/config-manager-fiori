sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheZC_FI_LIMIT_CONFList.iSeeThisPage();
            Then.onTheZC_FI_LIMIT_CONFList.onFilterBar().iCheckFilterField("Environment");
            Then.onTheZC_FI_LIMIT_CONFList.onFilterBar().iCheckFilterField("Expense Type");
            Then.onTheZC_FI_LIMIT_CONFList.onFilterBar().iCheckFilterField("G/L Account");
            Then.onTheZC_FI_LIMIT_CONFList.onTable().iCheckColumns(9, {"ActionType":{"header":"Action"},"EnvId":{"header":"Environment"},"ExpenseType":{"header":"Expense Type"},"GlAccount":{"header":"G/L Account"},"AutoApprLim":{"header":"Auto Approval Limit"},"Currency":{"header":"Currency"},"LineStatus":{"header":"Line Status"},"CreatedAt":{"header":"Time Stamp"},"ChangedAt":{"header":"Time Stamp"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheZC_FI_LIMIT_CONFList.onFilterBar().iExecuteSearch();
            
            Then.onTheZC_FI_LIMIT_CONFList.onTable().iCheckRows();

            When.onTheZC_FI_LIMIT_CONFList.onTable().iPressRow(0);
            Then.onTheZC_FI_LIMIT_CONFObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});