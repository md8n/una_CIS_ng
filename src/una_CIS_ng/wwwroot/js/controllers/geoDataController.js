(function (angular) {
  "use strict";

  angular
      .module("geoDataApp")
      .controller("geoDataController", geoDataController);

  function geoDataController($scope, geoData) {
    $scope.title = "geoDataController";
    $scope.geoData = geoData.APIData;
    $scope.IsDbConnected = geoData.IsDbConnected;

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoData"];
})(angular);
