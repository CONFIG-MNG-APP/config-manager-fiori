sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheMMSafeStockList.iSeeThisPage();
            Then.onTheMMSafeStockList.onFilterBar().iCheckFilterField("UUID");
            Then.onTheMMSafeStockList.onFilterBar().iCheckFilterField("Enviroment");
            Then.onTheMMSafeStockList.onFilterBar().iCheckFilterField("PlantId");
            Then.onTheMMSafeStockList.onFilterBar().iCheckFilterField("MatGroup");
            Then.onTheMMSafeStockList.onFilterBar().iCheckFilterField("MinQty");
            Then.onTheMMSafeStockList.onTable().iCheckColumns(8, {"ReqId":{"header":"Request ID"},"EnvId":{"header":"Environment"},"PlantId":{"header":"Plant"},"MatGroup":{"header":"Material Group"},"MinQty":{"header":"Min Quantity"},"LineStatus":{"header":"Status"},"CreatedAt":{"header":"Created At"},"ChangedAt":{"header":"Changed At"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheMMSafeStockList.onFilterBar().iExecuteSearch();
            
            Then.onTheMMSafeStockList.onTable().iCheckRows();

            When.onTheMMSafeStockList.onTable().iPressRow(0);
            Then.onTheMMSafeStockObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});