(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaElectronicaddress",
      function() {
        return {
          restrict: "E",
          scope: { elecInfo: "=elec"},
          templateUrl: "../../templates/una-electronicaddress.html"
        };
      });
})(angular);