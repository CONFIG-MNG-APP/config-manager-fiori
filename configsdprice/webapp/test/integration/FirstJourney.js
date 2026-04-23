sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheSDPriceConfList.iSeeThisPage();
            Then.onTheSDPriceConfList.onFilterBar().iCheckFilterField("Environment");
            Then.onTheSDPriceConfList.onFilterBar().iCheckFilterField("Branch");
            Then.onTheSDPriceConfList.onFilterBar().iCheckFilterField("Customer Group");
            Then.onTheSDPriceConfList.onTable().iCheckColumns(11, {"ActionType":{"header":"Action"},"LineStatus":{"header":"Status"},"EnvId":{"header":"Environment"},"BranchId":{"header":"Branch"},"CustGroup":{"header":"Customer Group"},"MaterialGrp":{"header":"Material Group"},"MaxDiscount":{"header":"Max Discount"},"Currency":{"header":"Currency"},"VersionNo":{"header":"Version"},"CreatedAt":{"header":"Created At"},"ChangedAt":{"header":"Changed At"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheSDPriceConfList.onFilterBar().iExecuteSearch();
            
            Then.onTheSDPriceConfList.onTable().iCheckRows();

            When.onTheSDPriceConfList.onTable().iPressRow(0);
            Then.onTheSDPriceConfObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});