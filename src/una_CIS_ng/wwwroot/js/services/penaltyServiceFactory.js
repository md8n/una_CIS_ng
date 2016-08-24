(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .factory("penaltyService", ["$resource",
    function ($resource) {
      return $resource("/api/Penalty/", {},
      {
        "All": { method: "GET", url: "/api/Penalty/All", isArray: true },
        "GeoData": { method: "GET", url: "/api/Penalty/GeoData", isArray: true },
        "IsDbConnected": { method: "GET", url: "/api/Penalty/IsDbConnected", isArray: false }
      });
      //alert("Failed to set up connection to server");
    }
  ]);
})(angular);