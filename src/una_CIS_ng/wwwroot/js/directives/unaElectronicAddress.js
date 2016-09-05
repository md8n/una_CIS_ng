(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaElectronicaddress",
      function() {
        return {
          restrict: "E",
          scope: { elecInfo: "=elec", parentInfo: "=parent" },
          templateUrl: "../../templates/una-electronicaddress.html"
        };
      });
})(angular);