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
    $scope.permit = $scope.permit || {};
    $scope.permit.title = "permitController";
    $scope.permit.permits = {
      "row": {
        "id": null,
        "type": "row",
        "locations": [],
        "parties": {
          "holder": {
            "id": null,
            "type": "holder",
            "addresses": { "physical": { "id": null, "type": "physical", "isMailing": true } }
          }
        }
      }
    };
    //$scope.apiData = geoDataService.APIData;
    $scope.permit.All = permitService.All().$promise.then(handlePermits);
    $scope.permit.Save = function () {
      var permit = $scope.permit.permits.row;
      alert('trying to save: ' + JSON.stringify(permit));
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
