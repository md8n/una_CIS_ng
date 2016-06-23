(function (angular) {
  "use strict";

  var handleGeoData = function (response) {
    if (Una.gMap) {
      const geoFeatures = response.map(function (obj) { return obj.Feature; });
      geoFeatures.forEach(function (feature) { Una.gMap.data.addGeoJson(feature) });
    }
    //alert("Loaded GeoData Successfully");
  };

  angular
    .module("geoDataApp") // defined in geoDataApp.js
    .controller("geoDataController", geoDataController);

  function geoDataController($scope, geoDataService) {
    $scope.title = "geoDataController";
    //$scope.apiData = geoDataService.APIData;
    $scope.geoData = geoDataService.All().$promise.then(handleGeoData);
    $scope.IsDbConnected = geoDataService.IsDbConnected();

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService"];
})(angular);
