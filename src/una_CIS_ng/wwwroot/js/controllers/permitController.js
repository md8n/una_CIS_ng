var permitScope;

(function (angular) {
  "use strict";

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
        // Note the deliberately wrong bbox
        "locations": { "type": "FeatureCollection", "bbox": [200, 100, -200, -100], "features": [] },
        "locationRoutes": [],
        "locationDescriptions": [],
        "parties": [
          {
            //"id": null,
            "type": "holder",
            "typeDesc": "Permit Holder",
            "entityTypeIsFixed": false,
            "isEmailRequired": true,
            "isNigeriaNumbersOnly": false,
            "isRequired": true,
            "electronicAddresses": [
              {
                //"id": null,
                "ownerAbbr": "holder",
                "type": "email",
                "typeDesc": "Email",
                "placeHolder": "email",
                "maxLength": "512",
                "includeExtension": false,
                "isRequired": true,
                "value": "",
                "extension": ""
              },
              {
                //"id": null,
                "ownerAbbr": "holder",
                "type": "mobile",
                "typeDesc": "Mobile",
                "placeHolder": "+234.xxx xxx xxxx",
                "maxLength": "36",
                "includeExtension": false,
                "isRequired": true,
                "value": "",
                "extension": ""
              },
              {
                //"id": null,
                "ownerAbbr": "holder",
                "type": "officePhone",
                "typeDesc": "Office Phone",
                "placeHolder": "+234.xxx xxx xxxx",
                "maxLength": "36",
                "includeExtension": true,
                "isRequired": false,
                "value": "",
                "extension": ""
              }
            ],
            "addresses": [
              {
                //"id": null,
                "ownerTitle": "",
                "ownerAbbr": "holder",
                "counterDesc": "",
                "addrForm": "Office Physical",
                "addrAdvice": "A Postal Box is NOT acceptable for the Office Physical Address fields.  If you do not have a physical address you may not be the Permit Holder.",
                "type": "physical",
                "isMailing": false,
                "mailingTypeIsFixed": false
              },
              {
                //"id": null,
                "ownerTitle": "",
                "ownerAbbr": "holder",
                "counterDesc": "",
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
    "type": "holderContact",
    "typeDesc": "Permit Holder Contact",
    "entityType": "Person",
    "entityTypeIsFixed": true,
    "isEmailRequired": true,
    "isNigeriaNumbersOnly": true,
    "isRequired": false,
    "electronicAddresses": [
      {
        //"id": null,
        "ownerAbbr": "holderContact",
        "type": "email",
        "typeDesc": "Email",
        "placeHolder": "email",
        "maxLength": "512",
        "includeExtension": false,
        "isRequired": true,
        "value": "",
        "extension": ""
      },
      {
        //"id": null,
        "ownerAbbr": "holderContact",
        "type": "mobile",
        "typeDesc": "Mobile",
        "placeHolder": "+234.xxx xxx xxxx",
        "maxLength": "36",
        "includeExtension": false,
        "isRequired": true,
        "value": "",
        "extension": ""
      },
      {
        //"id": null,
        "ownerAbbr": "holderContact",
        "type": "officePhone",
        "typeDesc": "Office Phone",
        "placeHolder": "+234.xxx xxx xxxx",
        "maxLength": "36",
        "includeExtension": true,
        "isRequired": false,
        "value": "",
        "extension": ""
      }
    ],
    "addresses": [
      {
        //"id": null,
        "ownerTitle": "Permit Holder Contact",
        "ownerAbbr": "holderContact",
        "counterDesc": "Primary",
        "addrForm": "Physical",
        "addrAdvice": "",
        "type": "physical",
        "isMailing": false,
        "mailingTypeIsFixed": false,
        "country": "Nigeria"
      },
      {
        //"id": null,
        "ownerTitle": "Permit Holder Contact",
        "ownerAbbr": "holderContact",
        "counterDesc": "Primary",
        "addrForm": "Postal",
        "addrAdvice": "",
        "type": "postal",
        "isMailing": true,
        "mailingTypeIsFixed": true,
        "country": "Nigeria"
      }
    ]
  },
  {
    //"id": null,
    "type": "infOwner",
    "typeDesc": "Infrastructure Owner",
    "isInfrastructureOwner": true,
    "entityType": "Organisation",
    "entityTypeIsFixed": false,
    "isEmailRequired": false,
    "isNigeriaNumbersOnly": false,
    "isRequired": false,
    "electronicAddresses": [
      {
        //"id": null,
        "ownerAbbr": "infOwner",
        "type": "email",
        "typeDesc": "Email",
        "placeHolder": "email",
        "maxLength": "512",
        "includeExtension": false,
        "isRequired": true,
        "value": "",
        "extension": ""
      },
      {
        //"id": null,
        "ownerAbbr": "infOwner",
        "type": "mobile",
        "typeDesc": "Mobile",
        "placeHolder": "+234.xxx xxx xxxx",
        "maxLength": "36",
        "includeExtension": false,
        "isRequired": true,
        "value": "",
        "extension": ""
      },
      {
        //"id": null,
        "ownerAbbr": "infOwner",
        "type": "officePhone",
        "typeDesc": "Office Phone",
        "placeHolder": "+234.xxx xxx xxxx",
        "maxLength": "36",
        "includeExtension": true,
        "isRequired": false,
        "value": "",
        "extension": ""
      }
    ],
    "addresses": [
      {
        //"id": null,
        "ownerTitle": "Infrastructure Owner",
        "ownerAbbr": "infOwner",
        "counterDesc": "Primary",
        "addrForm": "Office Physical",
        "addrAdvice": "",
        "type": "physical",
        "isMailing": false,
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
  }

        ],
        "isPreview": false
      }
    };

    permitScope.party = {};
    permitScope.party.findHolder = function (elem) { return elem.type === "holder" };
    permitScope.party.findHolderContact = function (elem) { return elem.type === "holderContact" };
    permitScope.party.findInfOwner = function (elem) { return elem.type === "infOwner" };

    permitScope.permit.setInfOwnerRequired = function () {
      var ppsrp = $scope.permit.permits.row.parties;
      var holder = ppsrp.find(permitScope.party.findHolder);
      var infOwner = ppsrp.find(permitScope.party.findInfOwner);

      infOwner.isRequired = !holder.isInfrastructureOwner;
      infOwner.addresses.forEach(function (addr) { addr.isRequired = infOwner.isRequired; });
    };

    permitScope.address = {};
    permitScope.address.findPhysical = function (elem) { return elem.type === "physical" };
    permitScope.address.findPostal = function (elem) { return elem.type === "postal" };

    permitScope.electronicAddress = {};
    permitScope.electronicAddress.findEmail = function (elem) { return elem.type === "email" };
    permitScope.electronicAddress.findMobile = function (elem) { return elem.type === "mobile" };
    permitScope.electronicAddress.findOfficePhone = function (elem) { return elem.type === "officePhone" };

    // locationPolylines must be held with the map to work effectively
    permitScope.map = permitScope.map || {};
    permitScope.map.locationPolylines = [];
    permitScope.map.markers = [];

    permitScope.calc = permitScope.calc || {};
    permitScope.calc.fees = [];

    var handleFeeDefinitions = function (response) {
      permitScope.calc.fees = permitScope.calc.fees || [];
      if (!!response) {
        var scopePrefix = "permitScope.permit.permits.row.";
        permitScope.calc.fees = response.map(function (obj) { return new feeDefinition(obj.feeType, obj.condition.replace(/\bcalc\./g, scopePrefix), obj.name, obj.unit, obj.divider, obj.measure, !!obj.rate ? obj.rate : obj.rateDesc); });
      }
    };
    permitScope.calc.All = feeDefinitionService.query(handleFeeDefinitions);

    permitScope.calc.applicationFilter = function (element) {
      var calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    permitScope.calc.undeclaredFilter = function (element) {
      var calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penaltyUndeclared") && eval(element.condition);
    };

    permitScope.calc.total = function (elements, filter, dimension, section, permits) {
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
      }, function (error) {
        // Error has occurred
        $scope.submitResult = "Submission Issues, please check your data and retry";
        pspr.isPreview = false;
      });
    };

    permitScope.IsDbConnected = permitService.IsDbConnected();

    // Call the Permit's own GeoData then feed the result to the GeoData Controller
    permitScope.permit.GeoData = permitService.GeoData().$promise.then(permitScope.GDHandleGeoData);

    // Allow permit's own GeoData to be callable by other controllers
    // Note that it in turn will call the GeoDataController
    $rootScope.$on("PermitGeoData", function () {
      //alert('called permit geodata');
      permitScope.permit.GeoData();
    });

    // Call to the GeoDataController exposed methods
    permitScope.GDHandleGeoData = function () { $rootScope.$emit("GeoDataHandleGeoData", {}); }
    permitScope.GDFitMap = function () { $rootScope.$emit("GeoDataFitMap", {}); }
  }

  permitController.$inject = ["$scope", "permitService", "feeDefinition"];
})(angular);
