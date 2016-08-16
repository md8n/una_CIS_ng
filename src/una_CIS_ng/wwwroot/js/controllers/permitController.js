var permitScope;

(function (angular) {
  "use strict";

  var handlePermits = function (response) {
    // Una.gMap is the google maps object returned by Map.cshtml and Permit.cshtml
    $scope.permit = $scope.permit || {};
    $scope.permit.geoFeatures = [];
    if (Una.gMap) {
      $scope.permit.geoFeatures = response.map(function (obj) { return obj.Permit; });
      $scope.permit.geoFeatures.forEach(function (permit) { Una.gMap.data.addGeoJson(permit); });
    }
    //alert("Loaded GeoData Successfully");
  };

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("permitController", ["$scope", "$rootScope", "permitService", "feeDefinition", "feeDefinitionService", permitController]);

  function permitController($scope, $rootScope, permitService, feeDefinition, feeDefinitionService) {
    $scope.permit = $scope.permit || {};

    permitScope = $scope;

    permitScope.title = "permitController";
    permitScope.bankDraftRecipient = "(To be advised by UNA Office)";
    permitScope.permit.permits = {
      "row": {
        "id": null,
        "type": "row",
        "infState": "Existing",
        "infLoc": "Business",
        "infDisc": "Declared",
        "infType": "Underground", // infrastructure type
        "consType": "Trenching",
        "consPermits": 1,
        "permState": "New", // permit state

        "distances": [],
        "totalDistance": 0,
        "locations": { "type": "FeatureCollection", "bbox": [200, 100, -200, -100], "features": [] },
        "locationRoutes": [],
        "locationDescriptions": [],
        "parties": {
          "holder": {
            "id": null,
            "type": "holder",
            "addresses": { "physical": { "id": null, "type": "physical", "isMailing": true } }
          }
        },
        "isPreview": false
      }
    };
    // locationPolylines must be held with the map to work effectively
    permitScope.map = permitScope.map || {};
    permitScope.map.locationPolylines = [];

    permitScope.permit.calc = permitScope.permit.calc || {};
    permitScope.permit.calc.fees = [];

    var handleFeeDefinitions = function (response) {
      permitScope.permit.calc.fees = permitScope.permit.calc.fees || [];
      if (!!response) {
        var scopePrefix = "permitScope.permit.permits.row.";
        permitScope.permit.calc.fees = response.map(function (obj) { return new feeDefinition(obj.feeType, obj.condition.replace(/\bcalc\./g, scopePrefix), obj.name, obj.unit, obj.divider, obj.measure, !!obj.rate ? obj.rate : obj.rateDesc); });
      }
    };
    permitScope.permit.calc.All = feeDefinitionService.query(handleFeeDefinitions);

    //permitScope.permit.calc.fees.push(new feeDefinition("application", "true", "Application Form Fee", 1, 1, "", 50000));
    //permitScope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.consType == 'HorizontalDrilling'", "Application Permit Fee - Underground Horizontal Drilling", 0, 1, "metre", 500));
    //permitScope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.consType == 'HorizontalDrilling'", "Application Permit Fee - Underground Horizontal Drilling Pits (x2)", 0, 1, "section", 6000));
    //permitScope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.consType == 'Trenching'", "Application Permit Fee - Underground Trenching", 0, 1, "metre", 3000));
    //permitScope.permit.calc.fees.push(new feeDefinition("application", "true", "Application Permit Fee - Remediation", 0, 1, "metre", 10000));
    //permitScope.permit.calc.fees.push(new feeDefinition("application", "permitScope.permit.permits.row.isSpecialZone", "Application Permit Fee - Location in Business / High Density Zone", 1, 1, "", 50000));
    //permitScope.permit.calc.fees.push(new feeDefinition("application", "true", "Application Permit Fee - First Annual Location Fee", 1, 1, "", 50000));

    //permitScope.permit.calc.fees.push(new feeDefinition("penalty", "permitScope.permit.permits.row.consType", "Penalty - Un-permitted underground infrastructure - Declared", 0, 1, "metre", 20000));
    //permitScope.permit.calc.fees.push(new feeDefinition("penaltyUndeclared", "permitScope.permit.permits.row.consType", "Penalty - Un-permitted underground infrastructure - Audited", 0, 1, "metre", 50000));
    ////permitScope.permit.calc.fees.push(new feeDefinition("penalty", "permitScope.permit.permits.row.infDisc == 'Declared'", "Penalty - Un-permitted underground infrastructure - Audited", 0, 1, "metre", 20000));
    ////permitScope.permit.calc.fees.push(new feeDefinition("penalty", "permitScope.permit.permits.row.infDisc == 'Discovered'", "Penalty - Un-permitted underground infrastructure - Audited", 0, 1, "metre", 50000));

    //permitScope.permit.calc.fees.push(new feeDefinition("penaltyExtended", "(permitScope.calc.infState == 'Existing' || permitScope.calc.infState == 'Decommissioning')", "Penalty - Failure to rectify after notice period has expired and action has been ordered", 1, 1, "", "full cost"));
    //permitScope.permit.calc.fees.push(new feeDefinition("penaltyExtended", "(permitScope.calc.infState == 'Existing' || permitScope.calc.infState == 'Decommissioning')", "Penalty - Any contravention or omission without a specific penalty listed above", 0, 1, "day", 50000));

    permitScope.permit.calc.applicationFilter = function (element) {
      var calc = $scope.permit.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    permitScope.permit.calc.undeclaredFilter = function (element) {
      var calc = $scope.permit.calc;
      return (element.feeType === "application" || element.feeType === "penaltyUndeclared") && eval(element.condition);
    };

    permitScope.permit.calc.total = function (elements, filter, dimension, section, permits) {
      var els = filter ? elements.filter(filter) : elements;

      if (els.length === 0) {
        return 0;
      }

      return els
        .map(function (el) { return el.total(dimension, section, permits); })
        .reduce(function (a, b) { return a + b; });
    };

    //permitScope.All = permitService.All().$promise.then(handlePermits);
    permitScope.permit.Save = function () {
      $scope.submitResult = "Submitting";

      var pspr = permitScope.permit.permits.row;

      //alert('trying to save: ' + JSON.stringify(permit));
      permitService.save(pspr, function (data) {
        // On success the data returned should have the objId of the permit
        $scope.submitResult = "Submitted";
        pspr.isPreview = false;
      }, function(error) {
        // Error has occurred
        $scope.submitResult = "Submission Issues, please check your data and retry";
        pspr.isPreview = false;
      });
    };

    permitScope.IsDbConnected = permitService.IsDbConnected();

    permitScope.GDFitMap = function () { $rootScope.$emit("GeoDataFitMap", {}); }

    //activate();

    //function activate() { }

    //permitScope.copyAddress = function(srcAddr, dstAddrType) {
    //  var dstAddr = { "type": dstAddrType };
    //  if (typeof srcAddr === "undefined" || srcAddr === null) {
    //    return dstAddr;
    //  };
    //  return dstAddr;
    //};
  }

  permitController.$inject = ["$scope", "permitService", "feeDefinition"];
})(angular);
