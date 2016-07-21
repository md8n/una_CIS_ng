var permitScope;

(function (angular) {
  "use strict";

  var handlePermits = function (response) {
    // Una.gMap is the google maps object returned by Map.cshtml and Permit.cshtml
    $scope.permit = $scope.permit || {};
    $scope.permit.geoFeatures = [];
    if (Una.gMap) {
      $scope.permit.geoFeatures = response.map(function (obj) { return obj.Permit; });
      $scope.permit.geoFeatures.forEach(function (permit) { Una.gMap.data.addGeoJson(permit) });
    }
    //alert("Loaded GeoData Successfully");
  };

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("permitController", ["$scope", "permitService", "feeDefinition", permitController]);

  function permitController($scope, permitService, feeDefinition) {
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
        "locationDescriptions": [],
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
    $scope.permit.calc.fees.push(new feeDefinition("application", "true", "Application Form Fee", 1, 1, "", 50000));
    $scope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.consType == 'HorizontalDrilling'", "Application Permit Fee - Underground Horizontal Drilling", 0, 1, "metre", 500));
    $scope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.consType == 'HorizontalDrilling'", "Application Permit Fee - Underground Horizontal Drilling Pits (x2)", 0, 1, "section", 6000));
    $scope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.consType == 'Trenching'", "Application Permit Fee - Underground Trenching", 0, 1, "metre", 3000));
    $scope.permit.calc.fees.push(new feeDefinition("application", "true", "Application Permit Fee - Remediation", 0, 1, "metre", 10000));
    $scope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.isSpecialZone", "Application Permit Fee - Location in Business / High Density Zone", 1, 1, "", 50000));
    $scope.permit.calc.fees.push(new feeDefinition("application", "true", "Application Permit Fee - First Annual Location Fee", 1, 1, "", 50000));

    $scope.permit.calc.fees.push(new feeDefinition("penalty", "permitScope.permit.permits.row.consType", "Penalty - Un-permitted underground infrastructure - Declared", 0, 1, "metre", 20000));
    //$scope.permit.calc.fees.push(new feeDefinition("penalty", "permitScope.permit.permits.row.infDisc == 'Declared'", "Penalty - Un-permitted underground infrastructure - Declared", 0, 1, "metre", 20000));
    //$scope.permit.calc.fees.push(new feeDefinition("penalty", "permitScope.permit.permits.row.infDisc == 'Discovered'", "Penalty - Un-permitted underground infrastructure - Audited", 0, 1, "metre", 50000));

    $scope.permit.calc.fees.push(new feeDefinition("penaltyExtended", "(permitScope.permit.calc.infState == 'Existing' || permitScope.permit.calc.infState == 'Decommissioning')", "Penalty - Failure to rectify after notice period has expired and action has been ordered", 1, 1, "", "full cost"));
    $scope.permit.calc.fees.push(new feeDefinition("penaltyExtended", "(permitScope.permit.calc.infState == 'Existing' || permitScope.permit.calc.infState == 'Decommissioning')", "Penalty - Any contravention or omission without a specific penalty listed above", 0, 1, "day", 50000));

    $scope.permit.calc.applicationFilter = function (element) {
      const calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    //$scope.permit.All = permitService.All().$promise.then(handlePermits);
    $scope.permit.Save = function () {
      var permit = $scope.permit.permits.row;
      //alert('trying to save: ' + JSON.stringify(permit));
      permitService.save(permit);
    };

    $scope.permit.IsDbConnected = permitService.IsDbConnected();

    //activate();

    //function activate() { }

    //$scope.permit.copyAddress = function(srcAddr, dstAddrType) {
    //  var dstAddr = { "type": dstAddrType };
    //  if (typeof srcAddr === "undefined" || srcAddr === null) {
    //    return dstAddr;
    //  };
    //  return dstAddr;
    //};
  }

  permitController.$inject = ["$scope", "permitService", "feeDefinition"];
})(angular);
