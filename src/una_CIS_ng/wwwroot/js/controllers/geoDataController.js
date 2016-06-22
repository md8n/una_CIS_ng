(function (angular) {
  "use strict";

  angular
    .module("geoDataApp") // defined in geoDataApp.js
    .controller("geoDataController", geoDataController);

  function geoDataController($scope, geoDataService) {
    $scope.title = "geoDataController";
    //$scope.apiData = geoDataService.APIData;
    //$scope.geoData = geoDataService.All;
    $scope.IsDbConnected = geoDataService.IsDbConnected;

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService"];
})(angular);
