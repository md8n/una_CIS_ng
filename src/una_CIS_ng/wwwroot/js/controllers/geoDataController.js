(function (angular) {
  "use strict";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("geoDataController", geoDataController);

  function geoDataController($scope, geoDataService) {
    const handleGeoData = function (response) {
      // Una.gMap is the google maps object returned by Map.cshtml and Permit.cshtml
      $scope.geoData = $scope.geoData || {};
      $scope.geoData.geoFeatures = [];
      if (Una.gMap) {
        $scope.geoData.geoFeatures = response.map(function (obj) { return obj.Feature; });
        $scope.geoData.geoFeatures.forEach(function (feature) { Una.gMap.data.addGeoJson(feature) });
      }
      //alert("Loaded GeoData Successfully");
    };

    $scope.geoData = $scope.geoData || {};
    $scope.geoData.title = "geoDataController";
    //$scope.apiData = geoDataService.APIData;
    $scope.geoData.All = geoDataService.All().$promise.then(handleGeoData);
    $scope.geoData.IsDbConnected = geoDataService.IsDbConnected();

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService"];
})(angular);
