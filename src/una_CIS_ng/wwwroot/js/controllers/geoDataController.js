(function (angular) {
  "use strict";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("geoDataController", geoDataController);

  function geoDataController($scope, geoDataService) {
    const handleGeoData = function (response) {
      // Una.gMap is the google maps object returned by Map.cshtml and Permit.cshtml
      $scope.geoData = $scope.geoData || {};
      $scope.geoData.geoFeatures = [];
      if (Una.gMap) {
        $scope.geoData.geoFeatures = response.map(function (obj) { return obj.Feature; });
        $scope.geoData.geoFeatures.forEach(function (feature) { Una.gMap.data.addGeoJson(feature) });
      }
      //alert("Loaded GeoData Successfully");
    };

    const resetMap = function () {
      if (!!Una.dm) {
        //alert(JSON.stringify($scope.permit.permits.row.locations));

        // Clear the drawingmanager
        Una.dm.setMap(null);
        Una.dm = new google.maps.drawing.DrawingManager({
          drawingMode: null, // google.maps.drawing.OverlayType.POLYLINE,
          drawingControl: true,
          drawingControlOptions: {
            position: gm.ControlPosition.TOP_CENTER,
            drawingModes: [
              gm.drawing.OverlayType.POLYLINE
            ]
          },
          polyLineOptions: {
            editable: true
          }
        });
        Una.dm.setMap(Una.gMap);

        // Clear the data (this impacts the fee calculation)
        $scope.permit.permits.row.distances.length = 0;
        $scope.permit.permits.row.totalDistance = 0;
        $scope.permit.permits.row.locations.features.length = 0;
        $scope.permit.permits.row.locationDescriptions.length = 0;

        // Clear the Infrastructure route and location details (added by unaMap.js)
        const infRt = document.getElementById("infRt");
        if (infRt) {
          let fc = infRt.lastChild;
          while (fc) {
            infRt.removeChild(fc);
            fc = infRt.lastChild;
          }
        }
        const infRtDesc = document.getElementById("infRtDesc");
        if (infRtDesc) {
          let fc = infRtDesc.lastChild;
          while (fc) {
            infRtDesc.removeChild(fc);
            fc = infRtDesc.lastChild;
          }
        }
      }
    }

    $scope.geoData = $scope.geoData || {};
    $scope.geoData.title = "geoDataController";
    //$scope.apiData = geoDataService.APIData;
    $scope.geoData.All = geoDataService.All().$promise.then(handleGeoData);
    $scope.geoData.IsDbConnected = geoDataService.IsDbConnected();
    $scope.geoData.ResetMap = resetMap;

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService"];
})(angular);
