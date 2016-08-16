(function (angular) {
  "use strict";

  angular
    .module("unaApp")
    .factory("feeDefinition",
      function() {
        // Constructor 
        function fee(feeType, condition, name, unit, divider, measure, rate) {
          this.feeType = feeType || "";
          this.condition = condition || "true";
          this.name = name || "";
          this.unit = unit || 0;
          this.divider = divider || 1.0;
          this.measure = measure || "";
          this.rate = rate || 500; // Could be 0
        }

        // "instance" methods using the prototype
        // and standard prototypical inheritance
        fee.prototype = {
          rateDesc: function() {
            if (this.measure === "") {
              return "";
            }
            return " " + (this.divider === 1 ? " per" : " for every " + this.divider) + " " + this.measure;
          },
          units: function (dimension, section, permits) {
            if (this.unit === 1) {
              return this.unit;
            }

            var dim = Number(dimension || 0);
            var sec = Number(section || 0);
            var prm = Number(permits || 0);

            switch (this.measure) {
              case "section":
                return sec;
              case "permit":
                return prm;
              default:
                return dim;
            }
          },
          total: function (dimension, section, permits) {
            var units = this.units(dimension, section, permits);
            if (this.divider === 0 || this.rate === 0 || units === 0) {
              return 0;
            }

            var total = (units / this.divider) * this.rate;

            return Math.round(total);
          }
        };

        // "static" methods - no access to this
        fee.formatNairaStr = function(sourceVal) {
          var lgCode = "en-NG";
          var curCode = "NGN";

          return sourceVal.toLocaleString(lgCode,
          { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });
        };

        // Return the constructor
        // this is what defines the actual injectable in the DI framework
        return fee;
      });
})(angular);