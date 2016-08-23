(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaAddressRo",
      function() {
        return {
          restrict: "E",
          scope: { addressInfo: "=addr"},
          templateUrl: "../../templates/una-address-ro.html"
        };
      });
})(angular);