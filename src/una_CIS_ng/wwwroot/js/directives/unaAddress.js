(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaAddress",
      function() {
        return {
          restrict: "E",
          scope: { addressInfo: "=addr"},
          templateUrl: "../../templates/una-address.html"
        };
      });
})(angular);