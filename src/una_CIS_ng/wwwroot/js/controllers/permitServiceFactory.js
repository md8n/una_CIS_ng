(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .factory("permitService", ["$resource",
    function ($resource) {
      return $resource("/api/Permit/", {},
      {
        "All": { method: "GET", url: "/api/Permit/All", isArray: true },
        "APIData": { method: "GET", params: {}, isArray: false },
        "IsDbConnected": { method: "GET", url: "/api/Permit/IsDbConnected", isArray: false }
      });
      alert("Failed to set up connection to server");
    }
  ]);
})(angular);