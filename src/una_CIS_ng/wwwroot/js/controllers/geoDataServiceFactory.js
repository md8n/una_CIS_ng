(function (angular) {
  "use strict";

  angular
    .module("geoDataApp")
    .factory("geoDataService", ["$resource",
    function ($resource) {
      return $resource("/api/GeoData/", {},
      {
        "All": { method: "GET", url: "/api/GeoData/All", isArray: true },
        "APIData": { method: "GET", params: {}, isArray: false },
        "IsDbConnected": { method: "GET", url: "/api/GeoData/IsDbConnected", isArray: false }
      });
      alert("Failed to set up connection to server");
    }
  ]);
})(angular);