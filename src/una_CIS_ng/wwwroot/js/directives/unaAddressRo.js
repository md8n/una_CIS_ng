(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaAddressro",
      function() {
        return {
          restrict: "E",
          scope: { addressInfo: "=addrro"},
          templateUrl: "../../templates/una-address-ro.html"
        };
      });
})(angular);