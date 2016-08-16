var feeCalculatorScope;

(function (angular) {
  "use strict";

  var lgCode = "en-NG";
  var curCode = "NGN";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("feeCalculatorController", ["$scope", "feeDefinition", "feeDefinitionService", feeCalculatorController]);

  function feeCalculatorController($scope, feeDefinition, feeDefinitionService) {
    feeCalculatorScope = $scope;

    $scope.calc = $scope.calc || {};
    $scope.calc.dimension = 0;
    $scope.calc.consPermits = 1;
    $scope.calc.section = 1;
    $scope.calc.fees = [];

    var handleFeeDefinitions = function (response) {
      $scope.calc.fees = $scope.calc.fees || [];
      if (!!response) {
        var scopePrefix = "calc.";
        $scope.calc.fees = response.map(function (obj) { return new feeDefinition(obj.feeType, obj.condition.replace(/\bcalc\./g, scopePrefix), obj.name, obj.unit, obj.divider, obj.measure, !!obj.rate ? obj.rate : obj.rateDesc); });
      }
    };
    $scope.calc.All = feeDefinitionService.query(handleFeeDefinitions);

    $scope.calc.total = function (elements, filter, dimension, section, permits) {
      var els = filter ? elements.filter(filter) : elements;

      if (els.length === 0) {
        return 0;
      }

      return els
        .map(function (el) { return el.total(dimension, section, permits); })
        .reduce(function (a, b) { return a + b; });
    }

    $scope.calc.applicationFilter = function (element) {
      var calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    $scope.calc.firstRenewalFilter = function (element) {
      var calc = $scope.calc;
      return element.feeType === "firstAnnual" && eval(element.condition);
    };

    $scope.calc.renewalFilter = function (element) {
      var calc = $scope.calc;
      return element.feeType === "annual" && eval(element.condition);
    };

    $scope.calc.penaltyFilter = function (element) {
      var calc = $scope.calc;
      return element.feeType === "penaltyExtended" && eval(element.condition);
    };

    //activate();

    //function activate() { }
  }

  feeCalculatorController.$inject = ["$scope", "feeDefinition", "feeDefinitionService"];
})(angular);
