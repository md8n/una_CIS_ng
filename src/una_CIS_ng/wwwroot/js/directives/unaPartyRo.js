(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaPartyRo",
      function() {
        return {
          restrict: "E",
          scope: { partyInfo: "=party"},
          templateUrl: "../../templates/una-party-ro.html"
        };
      });
})(angular);