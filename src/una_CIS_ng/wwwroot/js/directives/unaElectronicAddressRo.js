(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaElectronicaddressRo",
      function() {
        return {
          restrict: "E",
          scope: { elecInfo: "=elec", parentInfo: "=parent" },
          templateUrl: "../../templates/una-electronicaddress-ro.html"
        };
      });
})(angular);