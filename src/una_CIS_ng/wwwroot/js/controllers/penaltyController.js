var penaltyScope;

(function (angular) {
  "use strict";

  var handlePenalties = function (response) {
    $scope.penalty = $scope.penalty || {};
    $scope.penalty.geoFeatures = [];
    if (Una.gMap) {
      $scope.penalty.geoFeatures = response.map(function (obj) { return obj.Penalty; });
      $scope.penalty.geoFeatures.forEach(function (penalty) { Una.gMap.data.addGeoJson(penalty); });
    }
    //alert("Loaded GeoData Successfully");
  };

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("penaltyController",
    ["$scope", "$rootScope", "penaltyService", "feeDefinition", "feeDefinitionService", penaltyController]);

  function penaltyController($scope, $rootScope, penaltyService, feeDefinition, feeDefinitionService) {
    $scope.penalty = $scope.penalty || {};

    penaltyScope = $scope;

    penaltyScope.title = "penaltyController";
    penaltyScope.bankDraftRecipient = "(To be advised by UNA Office)";
    penaltyScope.penalty = {
      "infringing": {
        "id": null,
        "type": "infringingInfrastructureRemoval",
        "infState": "Infringing",
        "infLoc": "Business",
        "infDisc": "Discovered",
        "infType": "Underground", // infrastructure type
        "consType": "Trenching",
        "consPermits": 1,
        "permState": "None", // permit state
        "distances": [],
        "totalDistance": 0,
        // Note the deliberately wrong bbox
        "locations": { "type": "FeatureCollection", "bbox": [200, 100, -200, -100], "features": [] },
        "locationRoutes": [],
        "locationDescriptions": [],
        "parties": [
          {
            //"id": null,
            "type": "infOwner",
            "typeDesc": "Infrastructure Owner",
            "name": "",
            "isInfrastructureOwner": true,
            "entityType": "Organisation",
            "entityTypeIsFixed": false,
            "isEmailRequired": false,
            "isNigeriaNumbersOnly": false,
            "isRequired": true,
            "addresses": [
              {
                //"id": null,
                "ownerTitle": "Infrastructure Owner",
                "ownerAbbr": "infOwner",
                "counterDesc": "Primary",
                "addrForm": "Office Physical",
                "addrAdvice": "",
                "type": "physical",
                "isMailing": true,
                "mailingTypeIsFixed": false
              },
              {
                //"id": null,
                "ownerTitle": "Infrastructure Owner",
                "ownerAbbr": "infOwner",
                "counterDesc": "Primary",
                "addrForm": "Office Postal",
                "addrAdvice": "",
                "type": "postal",
                "isMailing": true,
                "mailingTypeIsFixed": true
              }
            ]
          },
          {
            //"id": null,
            "type": "affected",
            "typeDesc": "Affected Party",
            "entityTypeIsFixed": false,
            "isEmailRequired": false,
            "isNigeriaNumbersOnly": false,
            "isRequired": false,
            "addresses": [
              {
                //"id": null,
                "ownerTitle": "",
                "ownerAbbr": "affected",
                "counterDesc": "",
                "addrForm": "Office Physical",
                "addrAdvice": "",
                "type": "physical",
                "isMailing": true,
                "mailingTypeIsFixed": false
              },
              {
                //"id": null,
                "ownerTitle": "",
                "ownerAbbr": "affected",
                "counterDesc": "",
                "addrForm": "Office Postal",
                "addrAdvice": "",
                "type": "postal",
                "isMailing": true,
                "mailingTypeIsFixed": true
              }
            ]
          }
        ],
        "isPreview": false
      }
    };

    penaltyScope.party = {};
    penaltyScope.party.findInfOwner = function (elem) { return elem.type === "infOwner" };
    penaltyScope.party.findAffected = function (elem) { return elem.type === "affected" };

    penaltyScope.address = {};
    penaltyScope.address.findPhysical = function (elem) { return elem.type === "physical" };
    penaltyScope.address.findPostal = function (elem) { return elem.type === "postal" };

    // locationPolylines must be held with the map to work effectively
    penaltyScope.map = penaltyScope.map || {};
    penaltyScope.map.locationPolylines = [];
    penaltyScope.map.markers = [];

    penaltyScope.calc = penaltyScope.calc || {};
    penaltyScope.calc.fees = [];

    var handleFeeDefinitions = function (response) {
      penaltyScope.calc.fees = penaltyScope.calc.fees || [];
      if (!!response) {
        var scopePrefix = "penaltyScope.penalty.infringing.";
        penaltyScope.calc.fees = response.map(function (obj) { return new feeDefinition(obj.feeType, obj.condition.replace(/\bcalc\./g, scopePrefix), obj.name, obj.unit, obj.divider, obj.measure, !!obj.rate ? obj.rate : obj.rateDesc); });
      }
    };
    penaltyScope.calc.All = feeDefinitionService.query(handleFeeDefinitions);

    penaltyScope.calc.applicationFilter = function (element) {
      var calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    penaltyScope.calc.undeclaredFilter = function (element) {
      var calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penaltyUndeclared") && eval(element.condition);
    };

    penaltyScope.calc.total = function (elements, filter, dimension, section, permits) {
      var els = filter ? elements.filter(filter) : elements;

      if (els.length === 0) {
        return 0;
      }

      return els
        .map(function (el) { return el.total(dimension, section, permits); })
        .reduce(function (a, b) { return a + b; });
    };

    penaltyScope.penalty.Save = function () {
      $scope.submitResult = "Submitting";

      var pspi = penaltyScope.penalty.infringing;

      //alert('trying to save: ' + JSON.stringify(penalty));
      penaltyService.save(pspi, function (data) {
        // On success the data returned should have the objId of the penalty
        $scope.submitResult = "Submitted";
        pspi.isPreview = false;
      }, function (error) {
        // Error has occurred
        $scope.submitResult = "Submission Issues, please check your data and retry";
        pspi.isPreview = false;
      });
    };

    penaltyScope.IsDbConnected = penaltyService.IsDbConnected();
    penaltyScope.penalty.GeoData = penaltyService.GeoData().$promise.then(penaltyScope.GDHandleGeoData);

    penaltyScope.GDHandleGeoData = function () { $rootScope.$emit("GeoDataHandleGeoData", {}); }
    penaltyScope.GDFitMap = function () { $rootScope.$emit("GeoDataFitMap", {}); }
  }

  penaltyController.$inject = ["$scope", "penaltyService", "feeDefinition"];
})(angular);
