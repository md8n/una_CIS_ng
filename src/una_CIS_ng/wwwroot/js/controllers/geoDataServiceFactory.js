(function (angular) {
  "use strict";

  angular
    .module("geoDataApp")
    .factory("geoDataService", ["$resource",
    function ($resource) {
      alert("hi1");
      return $resource("/api/geoData/", {},
      {
        All: { method: "GET", verb: "All", isArray: true },
        APIData: { method: "GET", params: {}, isArray: false },
        IsDbConnected: { method: "GET", verb: "IsDbConnected", isArray: false }
      });
      alert("hi2");
    }
  ]);
})(angular);