(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaPartyro",
      function() {
        return {
          restrict: "E",
          scope: { partyInfo: "=partyro"},
          templateUrl: "../../templates/una-party-ro.html"
        };
      });
})(angular);