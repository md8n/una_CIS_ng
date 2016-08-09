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

        return true;
      }

      return false;
    }

    const addEventListener = function () {
      var gm = google.maps;

      const wasRebuilt = rebuildDrawingManager(gm);

      if (wasRebuilt) {
        gm.event.addListener(Una.dm,
          "polylinecomplete",
          function(pl) {
            const plP = pl.getPath();
            const dist = Math.floor(gm.geometry.spherical.computeLength(plP));

            const infLc = document.getElementById("location");
            if (infLc && permitScope) {
              // Set up a polyline feature - note the deliberately wrong initial values for bbox
              var polylineFeature = {
                "type": "Feature",
                "bbox": [200, 100, -200, -100],
                "geometry": { "type": "LineString", "coordinates": [] },
                "properties": {}
              };
              var lonLats = [];
              var pspr = permitScope.permit.permits.row;
              pspr.locationDescriptions.push([]);
              var locDescCount = pspr.locationDescriptions.length;
              for (var ix = 0; ix < plP.getLength() ; ix++) {
                const pt = plP.getAt(ix);
                const lon = Number(Math.round(pt.lng() + 'e7') + 'e-7');
                const lat = Number(Math.round(pt.lat() + 'e7') + 'e-7');

                lonLats.push([lon, lat]);
                polylineFeature.geometry.coordinates.push([lon, lat]);

                // Set this feature's bbox
                if (lon < polylineFeature.bbox[0]) {
                  polylineFeature.bbox[0] = lon;
                }
                if (lat < polylineFeature.bbox[1]) {
                  polylineFeature.bbox[1] = lat;
                }
                if (lon > polylineFeature.bbox[2]) {
                  polylineFeature.bbox[2] = lon;
                }
                if (lat > polylineFeature.bbox[3]) {
                  polylineFeature.bbox[3] = lat;
                }

                // Set the bbox for the entire featurecollection
                if (lon < pspr.locations.bbox[0]) {
                  pspr.locations.bbox[0] = lon;
                }
                if (lat < pspr.locations.bbox[1]) {
                  pspr.locations.bbox[1] = lat;
                }
                if (lon > pspr.locations.bbox[2]) {
                  pspr.locations.bbox[2] = lon;
                }
                if (lat > pspr.locations.bbox[3]) {
                  pspr.locations.bbox[3] = lat;
                }

                var latLngBounds = {
                  west: pspr.locations.bbox[0],
                  south: pspr.locations.bbox[1],
                  east: pspr.locations.bbox[2],
                  north: pspr.locations.bbox[3]
                };
                //Una.gMap.fitBounds(latLngBounds);

                setTimeout(function (lon, lat, locDescCount) {
                    var mStatus = geocode({ lng: lon, lat: lat }, locDescCount - 1);
                    if (mStatus == gm.GeocoderStatus.OVER_QUERY_LIMIT) {
                      alert('Warning: The Geocoder had problems getting a particular location result.  This is just a notice, you may still submit your application.');
                    }
                  },
                  200 * ix, lon, lat, locDescCount);
              }

              pspr.locations.features.push(polylineFeature);
              pspr.locationRoutes.push(lonLats);
              permitScope.map.locationPolylines.push(pl);
              pspr.distances.push(dist);
              pspr.totalDistance = pspr.distances.reduce(function (a, b) { return a + b; });
            }
          });
      }
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
        $scope.map.locationPolylines.forEach(function (el) { el.setMap(null); });
        $scope.map.locationPolylines.length = 0;

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
