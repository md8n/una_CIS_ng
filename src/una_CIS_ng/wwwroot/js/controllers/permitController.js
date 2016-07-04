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
    $scope.title = "permitController";
    //$scope.apiData = geoDataService.APIData;
    $scope.permit = permitService.All().$promise.then(handlePermits);
    $scope.IsDbConnected = permitService.IsDbConnected();

    //activate();

    //function activate() { }
  }

  permitController.$inject = ["$scope", "permitService"];
})(angular);
