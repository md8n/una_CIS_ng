var feeCalculatorScope;

(function (angular) {
  "use strict";

  const lgCode = "en-NG";
  const curCode = "NGN";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("feeCalculatorController", feeCalculatorController);

  function feeCalculatorController($scope) {
    feeCalculatorScope = $scope;

    $scope.calc = $scope.calc || {};
    $scope.calc.fees = [];
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.permState == 'New' || calc.permState == 'Temporary' || calc.permState == 'cannot'", "name": "Application Form Fee", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "(calc.infState == 'New' || calc.infState == 'Decommissioning') && calc.permState ==  'New' && (calc.infType == 'TransTower' || calc.infType == 'OtherTower' || calc.infType == 'Dish')", "name": "Construction Permit Fee - Tower / Mast / Dish", "unit": 1, "divider": 1, "measure": "", "rate": 20000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "(calc.infState == 'New' || calc.infState == 'Decommissioning') && calc.permState ==  'New' && calc.infType == 'Underground'", "name": "Construction Permit Fee - Underground", "unit": 1, "divider": 1, "measure": "", "rate": 10000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'New' && calc.infType == 'TransTower'", "name": "Application Permit Fee - Transmission Tower Elevation", "unit": 0, "divider": 3, "measure": "feet", "rate": 10000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'New' && calc.infType == 'OtherTower'", "name": "Application Permit Fee - (Other) Tower Elevation", "unit": 0, "divider": 5, "measure": "feet", "rate": 8000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'New' && calc.infType == 'Dish'", "name": "Application Permit Fee - Dish Diameter", "unit": 0, "divider": 1.5, "measure": "metre", "rate": 100000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Temporary') && calc.infType == 'Underground'", "name": "Application Permit Fee - Underground", "unit": 0, "divider": 1, "rate": 500, "measure": "metre", "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'New' && (calc.infLoc == 'Business' || calc.infLoc == 'HighDensity')", "name": "Application Permit Fee - Location in Business / High Density Zone", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'New'", "name": "Application Permit Fee - First Annual Location Fee", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'Temporary'", "name": "Annual Temporary Permit Fee - Existing (un-permitted) Infrastructure", "unit": 1, "divider": 1, "measure": "", "rate": 50000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'Temporary' && calc.infType == 'TransTower'", "name": "Annual Temporary Permit Fee - Existing (un-permitted) Infrastructure - Transmission Tower Elevation", "unit": 0, "divider": 3, "measure": "feet", "rate": 12000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "application", "condition": "calc.infState != 'Decommissioning' && calc.permState == 'Temporary' && calc.infType == 'Dish'", "name": "Annual Temporary Permit Fee - Existing (un-permitted) Infrastructure - Dish Diameter", "unit": 0, "divider": 1.5, "measure": "metre", "rate": 100000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "firstAnnual", "condition": "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing')", "name": "Annual Permit Fee - Application Renewal (First Anniversary)", "unit": 1, "divider": 1, "measure": "", "rate": 25000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "annual", "condition": "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing') && (calc.infType == 'TransTower' || calc.infType == 'OtherTower')", "name": "Annual Permit Fee - Location - Tower", "unit": 0, "divider": 5, "measure": "feet", "rate": 2000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "annual", "condition": "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing') && (calc.infType == 'TransTower' || calc.infType == 'OtherTower')", "name": "Annual Permit Fee - Permit Renewal - Tower Elevation", "unit": 0, "divider": 5, "measure": "feet", "rate": 10000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "annual", "condition": "calc.infState != 'Decommissioning' && (calc.permState == 'New' || calc.permState == 'Existing') && calc.infType == 'Dish'", "name": "Annual Permit Fee - Permit Renewal - Dish", "unit": 1, "divider": 1, "measure": "", "rate": 100000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "penalty", "condition": "(calc.infState == 'Existing' || calc.infState == 'Decommissioning') && calc.permState != 'Existing' && calc.infType == 'Underground'", "name": "Penalty - Un-permitted underground infrastructure - Failure to obtain Right-of-Way Permit", "unit": 0, "divider": 1, "measure": "section", "rate": 20000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "penalty", "condition": "calc.infState == 'Decommissioning' && (calc.permState != 'Existing' && calc.permState != 'Cannot')", "name": "Penalty - Unused Infrastructure - Failure to notify and / or to decommission within thirty (30) days", "unit": 1, "divider": 1, "measure": "", "rate": 25000, "total": 0 });
    $scope.calc.fees.push({ "feeType": "penaltyExtended", "condition": "(calc.infState == 'Existing' || calc.infState == 'Decommissioning') && calc.permState == 'Cannot' && calc.infType != 'Underground'", "name": "Annual Settlement Fee - Existing Non-Conforming Antenna", "unit": 1, "divider": 1, "measure": "annual", "rate": "50000 - 250000", "total": 0 });
    $scope.calc.fees.push({ "feeType": "penaltyExtended", "condition": "(calc.infState == 'Existing' || calc.infState == 'Decommissioning')", "name": "Penalty - Failure to rectify after notice period has expired and action has been ordered", "unit": 1, "divider": 1, "measure": "", "rate": "full cost", "total": 0 });
    $scope.calc.fees.push({ "feeType": "penaltyExtended", "condition": "(calc.infState == 'Existing' || calc.infState == 'Decommissioning')", "name": "Penalty - Any contravention or omission without a specific penalty listed above", "unit": 0, "divider": 1, "measure": "day", "rate": 50000, "total": 0 });

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

  feeCalculatorController.$inject = ["$scope"];
})(angular);
