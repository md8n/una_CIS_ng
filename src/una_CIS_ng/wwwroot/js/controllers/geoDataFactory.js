(function (angular) {
  "use strict";

  var geoDataService = angular.module("geoDataService", ["ngResource"]);
  geoDataService.factory("geoData", ["$resource",
    function($resource) {
      return $resource("/api/geoData/", {},
      {
        APIData: { method: "GET", params: {}, isArray: false },
        IsDbConnected: { method: "GET", verb: "IsDbConnected", isArray: false }
      });
      alert("hi2");
    }
  ]);
})(angular);