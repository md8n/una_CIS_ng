(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .directive("unaParty",
      function() {
        return {
          restrict: "E",
          scope: { partyInfo: "=party"},
          templateUrl: "../../templates/una-party.html"
        };
      });
})(angular);