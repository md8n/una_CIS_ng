(function (angular) {
  "use strict";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("geoDataController", ["$scope", "geoDataService", geoDataController]);

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

    const rebuildDrawingManager = function (gm) {
      if (!Una.dm) {
        Una.dm = new gm.drawing.DrawingManager({
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
      }
    }

    const addEventListener = function() {
      var gm = google.maps;

      rebuildDrawingManager(gm);

      gm.event.addListener(Una.dm,
        "polylinecomplete",
        function (pl) {
          const plP = pl.getPath();
          const dist = Math.floor(gm.geometry.spherical.computeLength(plP));

          const infLc = document.getElementById("location");
          if (infLc && permitScope) {
            const polylineFeature = { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [] }, "properties": {} };
            var lonLats = [];
            $scope.permit.permits.row.locationDescriptions.push([]);
            var locDescCount = permitScope.permit.permits.row.locationDescriptions.length;
            for (var ix = 0; ix < plP.getLength() ; ix++) {
              const pt = plP.getAt(ix);
              const lon = Number(Math.round(pt.lng() + 'e7') + 'e-7');
              const lat = Number(Math.round(pt.lat() + 'e7') + 'e-7');

              lonLats.push([lon, lat]);
              polylineFeature.geometry.coordinates.push([lon, lat]);

              geocode({ lng: lon, lat: lat }, locDescCount - 1);
            }

            $scope.permit.permits.row.locations.features.push(polylineFeature);
            $scope.permit.permits.row.locationRoutes.push(lonLats);
            $scope.permit.permits.row.locationPolylines.push(pl);
            $scope.permit.permits.row.distances.push(dist);
            $scope.permit.permits.row.totalDistance = $scope.permit.permits.row.distances.reduce(function (a, b) { return a + b; });
          }
        });
    }

    const resetMap = function () {
      var gm = google.maps;

      rebuildDrawingManager(gm);
      if (!!Una.dm) {
        //alert(JSON.stringify($scope.permit.permits.row.locations));

        // Clear the drawingmanager
        Una.dm.setMap(null);
        Una.dm.setMap(Una.gMap);

        // Clear the data (this impacts the fee calculation)
        $scope.permit.permits.row.distances.length = 0;
        $scope.permit.permits.row.totalDistance = 0;
        $scope.permit.permits.row.locations.features.length = 0;
        $scope.permit.permits.row.locationRoutes.length = 0;
        $scope.permit.permits.row.locationDescriptions.length = 0;

        // detach the polylines from the map first, then throw them all away
        $scope.permit.permits.row.locationPolylines.forEach(function (el) { el.setMap(null); });
        $scope.permit.permits.row.locationPolylines.length = 0;

        addEventListener();
      }
    }

    $scope.geoData = $scope.geoData || {};
    $scope.geoData.title = "geoDataController";
    //$scope.apiData = geoDataService.APIData;
    $scope.geoData.All = geoDataService.All().$promise.then(handleGeoData);
    $scope.geoData.IsDbConnected = geoDataService.IsDbConnected();
    $scope.geoData.ResetMap = resetMap;
    $scope.geoData.AddEventListener = addEventListener;

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService"];
})(angular);
