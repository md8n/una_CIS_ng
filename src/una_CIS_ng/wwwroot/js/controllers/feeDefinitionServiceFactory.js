(function (angular) {
  "use strict";

  angular
  .module("unaApp")
  .factory("feeDefinitionService", ["$resource",
  function ($resource) {
    return $resource("/api/FeeDefinition/", {},
    {
      //"All": { method: "GET", url: "/api/FeeDefinition/All", isArray: true },
      "APIData": { method: "GET", params: {}, isArray: false },
      "IsDbConnected": { method: "GET", url: "/api/FeeDefinition/IsDbConnected", isArray: false }
    });
    alert("Failed to set up connection to server");
  }
  ]);
})(angular);