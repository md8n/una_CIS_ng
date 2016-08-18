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
        "locations": { "type": "FeatureCollection", "bbox": [2.705989, 6.375578, 4.351192, 6.430167], "features": [] },
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
    permitScope.permit.GeoData = permitService.GeoData().$promise.then(permitScope.GDHandleGeoData);

    permitScope.GDHandleGeoData = function () { $rootScope.$emit("GeoDataHandleGeoData", {}); }
    permitScope.GDFitMap = function () { $rootScope.$emit("GeoDataFitMap", {}); }
  }

  permitController.$inject = ["$scope", "permitService", "feeDefinition"];
})(angular);
