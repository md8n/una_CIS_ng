var permitScope;

(function (angular) {
  "use strict";

  var handlePermits = function (response) {
    if (Una.gMap) {
      const geoFeatures = response.map(function (obj) { return obj.Permit; });
      geoFeatures.forEach(function (permit) { Una.gMap.data.addGeoJson(permit) });
    }
    //alert("Loaded GeoData Successfully");
  };

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("permitController", permitController);

  function permitController($scope, permitService) {
    permitScope = $scope;

    $scope.permit = $scope.permit || {};
    $scope.permit.title = "permitController";
    $scope.permit.permits = {
      "row": {
        "id": null,
        "type": "row",
        "isSpecialZone": true,
        "consType": "Trenching",
        "distances": [],
        "totalDistance": 0,
        "locations": { "type": "FeatureCollection", "features": [] },
        "parties": {
          "holder": {
            "id": null,
            "type": "holder",
            "addresses": { "physical": { "id": null, "type": "physical", "isMailing": true } }
          }
        }
      }
    };

    $scope.permit.calc = $scope.permit.calc || {};
    $scope.permit.calc.fees = [];
    $scope.permit.calc.fees.push({ "feeType": "application", "condition": "true", "name": "Application Form Fee", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "application", "condition": "permitScope.permit.permits.row.consType == 'HorizontalDrilling'", "name": "Application Permit Fee - Underground Horizontal Drilling", "unit": 0, "divider": 1, "rate": 500, "measure": "metre", "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "application", "condition": "permitScope.permit.permits.row.consType == 'Trenching'", "name": "Application Permit Fee - Underground Trenching", "unit": 0, "divider": 1, "rate": 3000, "measure": "metre", "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "application", "condition": "true", "name": "Application Permit Fee - Remediation", "unit": 0, "divider": 1, "rate": 10000, "measure": "metre", "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "application", "condition": "permitScope.permit.permits.row.isSpecialZone", "name": "Application Permit Fee - Location in Business / High Density Zone", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "application", "condition": "true", "name": "Application Permit Fee - First Annual Location Fee", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "penalty", "condition": "true", "name": "Penalty - Un-permitted underground infrastructure - Failure to obtain Right-of-Way Permit", "unit": 0, "divider": 1, "measure": "section", "rate": 20000, "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "penaltyExtended", "condition": "(permitScope.permit.calc.infState == 'Existing' || permitScope.permit.calc.infState == 'Decommissioning')", "name": "Penalty - Failure to rectify after notice period has expired and action has been ordered", "unit": 1, "divider": 1, "measure": "", "rate": "full cost", "total": 0 });
    $scope.permit.calc.fees.push({ "feeType": "penaltyExtended", "condition": "(permitScope.permit.calc.infState == 'Existing' || permitScope.permit.calc.infState == 'Decommissioning')", "name": "Penalty - Any contravention or omission without a specific penalty listed above", "unit": 0, "divider": 1, "measure": "day", "rate": 50000, "total": 0 });

    $scope.permit.calc.applicationFilter = function (element) {
      const calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    //$scope.apiData = geoDataService.APIData;
    $scope.permit.All = permitService.All().$promise.then(handlePermits);
    $scope.permit.Save = function () {
      var permit = $scope.permit.permits.row;
      //alert('trying to save: ' + JSON.stringify(permit));
      permitService.save(permit);
    };

    $scope.permit.IsDbConnected = permitService.IsDbConnected();

    //activate();

    //function activate() { }

    $scope.permit.copyAddress = function(srcAddr, dstAddrType) {
      var dstAddr = { "type": dstAddrType };
      if (typeof srcAddr === "undefined" || srcAddr === null) {
        return dstAddr;
      };
      return dstAddr;
    };
  }

  permitController.$inject = ["$scope", "permitService"];
})(angular);
