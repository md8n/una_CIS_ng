(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaElectronicaddressro",
      function() {
        return {
          restrict: "E",
          scope: { elecInfo: "=elecro", parentInfo: "=parentro" },
          templateUrl: "../../templates/una-electronicaddress-ro.html"
        };
      });
})(angular);