(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaElectronicAddressRo",
      function() {
        return {
          restrict: "E",
          scope: { addressInfo: "=elecAddr"},
          templateUrl: "../../templates/una-electronicaddress-ro.html"
        };
      });
})(angular);