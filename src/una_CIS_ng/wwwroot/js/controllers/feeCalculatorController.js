var feeCalculatorScope;

(function (angular) {
  "use strict";

  const lgCode = "en-NG";
  const curCode = "NGN";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("feeCalculatorController", ["$scope", "feeDefinition", feeCalculatorController]);

  function feeCalculatorController($scope, feeDefinition) {
    feeCalculatorScope = $scope;

    $scope.calc = $scope.calc || {};
    $scope.calc.fees = [];
    //feeType, condition, name, unit, divider, measure, rate
    $scope.calc.fees.push(new feeDefinition("application", "calc.permState == 'New' || calc.permState == 'Temporary' || calc.permState == 'cannot'", "Application Form Fee", 1, 1, "", 50000));
    $scope.calc.fees.push(new feeDefinition("application", "(calc.infState == 'New' || calc.infState == 'Decommissioning') && (calc.infType == 'TransTower' || calc.infType == 'OtherTower' || calc.infType == 'Dish')", "Construction Permit Fee - Tower / Mast / Dish", 1, 1, "", 20000));
    $scope.calc.fees.push(new feeDefinition("application", "(calc.infState == 'New' || calc.infState == 'Decommissioning') && calc.infType == 'Underground'", "Construction Permit Fee - Underground", 1, 1, "", 10000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'New' && calc.infType == 'TransTower'", "Application Permit Fee - Transmission Tower Elevation", 0, 3, "feet", 10000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'New' && calc.infType == 'OtherTower'", "Application Permit Fee - (Other) Tower Elevation", 0, 5, "feet", 8000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'New' && calc.infType == 'Dish'", "Application Permit Fee - Dish Diameter", 0, 1.5, "metre", 100000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Temporary') && calc.infType == 'Underground' && calc.consType == 'HorizontalDrilling'", "Application Permit Fee - Underground Horizontal Drilling", 0, 1, "metre", 500));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Temporary') && calc.infType == 'Underground' && calc.consType == 'HorizontalDrilling'", "Application Permit Fee - Underground Horizontal Drilling Pits (x2)", 0, 1, "section", 6000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Temporary') && calc.infType == 'Underground' && calc.consType == 'Trenching'", "Application Permit Fee - Underground Trenching", 0, 1, "metre", 3000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Temporary') && calc.infType == 'Underground'", "Application Permit Fee - Remediation", 0, 1, "metre", 10000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'New' && (calc.infLoc == 'Business' || calc.infLoc == 'HighDensity')", "Application Permit Fee - Location in Business / High Density Zone", 1, 1, "", 50000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'New'", "Application Permit Fee - First Annual Location Fee", 1, 1, "", 50000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'Temporary'", "Annual Temporary Permit Fee - Existing (un-permitted) Infrastructure", 1, 1, "", 50000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'Temporary' && calc.infType == 'TransTower'", "Annual Temporary Permit Fee - Existing (un-permitted) Infrastructure - Transmission Tower Elevation", 0, 3, "feet", 12000));
    $scope.calc.fees.push(new feeDefinition("application", "calc.infState != 'Decommissioning' && calc.permState == 'Temporary' && calc.infType == 'Dish'", "Annual Temporary Permit Fee - Existing (un-permitted) Infrastructure - Dish Diameter", 0, 1.5, "metre", 100000));
    $scope.calc.fees.push(new feeDefinition("firstAnnual", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing')", "Annual Permit Fee - Application Renewal (First Anniversary)", 1, 1, "", 25000));
    $scope.calc.fees.push(new feeDefinition("annual", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing') && (calc.infType == 'TransTower' || calc.infType == 'OtherTower')", "Annual Permit Fee - Location - Tower", 0, 5, "feet", 2000));
    $scope.calc.fees.push(new feeDefinition("annual", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing') && (calc.infType == 'TransTower' || calc.infType == 'OtherTower')", "Annual Permit Fee - Permit Renewal - Tower Elevation", 0, 5, "feet", 10000));
    $scope.calc.fees.push(new feeDefinition("annual", "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing') && calc.infType == 'Dish'", "Annual Permit Fee - Permit Renewal - Dish", 1, 1, "", 100000));
    $scope.calc.fees.push(new feeDefinition("penalty", "calc.infState != 'New' && calc.permState != 'Existing' && calc.infType == 'Underground' && calc.infDisc == 'Declared'", "Penalty - Un-permitted underground infrastructure - Declared", 0, 1,"metre", 20000));
    $scope.calc.fees.push(new feeDefinition("penalty", "calc.infState != 'New' && calc.permState != 'Existing' && calc.infType == 'Underground' && calc.infDisc == 'Discovered'", "Penalty - Un-permitted underground infrastructure - Audited", 0, 1, "metre", 50000));
    $scope.calc.fees.push(new feeDefinition("penalty", "calc.infState == 'Decommissioning' && (calc.permState != 'Existing' && calc.permState != 'Cannot')", "Penalty - Unused Infrastructure - Failure to notify and / or to decommission within thirty (30) days", 1, 1, "", 25000));
    $scope.calc.fees.push(new feeDefinition("penaltyExtended", "(calc.infState == 'Existing' || calc.infState == 'Decommissioning') && calc.permState == 'Cannot' && calc.infType != 'Underground'", "Annual Settlement Fee - Existing Non-Conforming Antenna", 1, 1, "annual", "N 50,000 - N 250,000"));
    $scope.calc.fees.push(new feeDefinition("penaltyExtended", "(calc.infState == 'Existing' || calc.infState == 'Decommissioning')", "Penalty - Failure to rectify after notice period has expired and action has been ordered", 1, 1, "", "full cost"));
    $scope.calc.fees.push(new feeDefinition("penaltyExtended", "(calc.infState == 'Existing' || calc.infState == 'Decommissioning')", "Penalty - Any contravention or omission without a specific penalty listed above", 0, 1, "day", "N 50,000"));

    $scope.calc.applicationFilter = function (element) {
      const calc = $scope.calc;
      return (element.feeType === "application" || element.feeType === "penalty") && eval(element.condition);
    };

    $scope.calc.firstRenewalFilter = function (element) {
      const calc = $scope.calc;
      return element.feeType === "firstAnnual" && eval(element.condition);
    };

    $scope.calc.renewalFilter = function (element) {
      const calc = $scope.calc;
      return element.feeType === "annual" && eval(element.condition);
    };

    $scope.calc.penaltyFilter = function (element) {
      const calc = $scope.calc;
      return element.feeType === "penaltyExtended" && eval(element.condition);
    };

    //activate();

    //function activate() { }
  }

  feeCalculatorController.$inject = ["$scope", "feeDefinition"];
})(angular);
