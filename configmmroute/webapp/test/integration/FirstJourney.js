sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheMMRouteConfList.iSeeThisPage();
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Environment");
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Plant");
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Sending Warehouse");
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Receiving Warehouse");
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Transport Mode");
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Allowed");
            Then.onTheMMRouteConfList.onFilterBar().iCheckFilterField("Inspector");
            Then.onTheMMRouteConfList.onTable().iCheckColumns(12, {"ActionType":{"header":"Action"},"EnvId":{"header":"Environment"},"PlantId":{"header":"Plant"},"SendWh":{"header":"Sending Warehouse"},"ReceiveWh":{"header":"Receiving Warehouse"},"TransMode":{"header":"Transport Mode"},"IsAllowed":{"header":"Allowed"},"InspectorId":{"header":"Inspector"},"LineStatus":{"header":"Line Status"},"VersionNo":{"header":"Version"},"CreatedAt":{"header":"Created At"},"ChangedAt":{"header":"Changed At"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheMMRouteConfList.onFilterBar().iExecuteSearch();
            
            Then.onTheMMRouteConfList.onTable().iCheckRows();

            When.onTheMMRouteConfList.onTable().iPressRow(0);
            Then.onTheMMRouteConfObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});