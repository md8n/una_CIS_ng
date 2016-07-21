(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .factory("feeDefinition", function() {
      // Constructor 
      function fee(feeType, condition, name, unit, divider, measure, rate) {
        this.feeType = feeType || "";
        this.condition = condition || "true";
        this.name = name || "";
        this.unit = unit || 0;
        this.divider = divider || 1.0;
        this.measure = measure || "";
        this.rate = rate || 500; // Could be 0
      };

      // "instance" methods using the prototype
      // and standard prototypical inheritance
      fee.prototype = {
        rateDesc: function () {
          if (this.measure === "") {
            return "";
          }
          return " " + (this.divider === 1 ? " per" : " for every " + this.divider) + " " + this.measure;
        },
        units: function(dimension, section) {
          if (this.unit === 1) {
            return this.unit;
          }

          const dim = Number(dimension || 0);
          const sec = Number(section || 0);

          return this.measure === "section" ? sec : dim;
        },
        total: function (dimension, section) {
          const units = this.units(dimension, section);
          if (this.divider === 0 || this.rate === 0 || units === 0) {
            return 0;
          }

          const total = (units / this.divider) * this.rate;

          return Math.round(total);
        }
      }

      // "static" methods - no access to this
      fee.formatNairaStr = function(sourceVal) {
        const lgCode = "en-NG";
        const curCode = "NGN";

        return sourceVal.toLocaleString(lgCode,
          { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }

      // Return the constructor
      // this is what defines the actual injectable in the DI framework
      return (fee);
    });
})(angular);