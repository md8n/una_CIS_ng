(function (angular) {
  //"use strict";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("geoDataController", ["$scope", "geoDataService", geoDataController]);

  function geoDataController($scope, geoDataService) {
    var gm = null;
    var geocoder = null;
    var map = null;
    var dm = null;
    var dmRebuilt = false;

    function unaMap(mapElId) {
      gm = google.maps;
      geocoder = new gm.Geocoder;

      if (!!gm && !!gm.Map) {
        map = new gm.Map(document.getElementById(mapElId),
        {
          center: { lat: 6.520226, lng: 3.468163 }, // 6.520226, 3.468163
          zoom: 9
        });

        //infowindow = new gm.InfoWindow;

        resetMap();
      }
    };

    // Set up the callback for Google Maps API
    $scope.initMap = function () {
      const uMap = unaMap("map");
      //Una.gMap = unaMap.map;
      //Una.dm = unaMap.drawingManager;
      //alert("Una loaded:" + !!Una + " map loaded:" + !!Una.gMap + " DrawingManager loaded:" + !!Una.dm);
    };
    const initMap = function () {
      $scope.initMap();
    }
    window.initMap = initMap;

    // distance calc derived from www.geodatasource.com
    function distance(lonlat1, lonlat2) {
      const radlat1 = Math.PI * lonlat1.lat / 180;
      const radlat2 = Math.PI * lonlat2.lat / 180;
      const radtheta = Math.PI * (lonlat1.lng - lonlat2.lng) / 180;
      const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      // note: not interested in conversion to miles, Kms, Nms, etc.
      return Math.acos(dist) * (180 / Math.PI);
    }

    // These are the address types we're after. 
    // If none of these are present then we'll fall back to just taking the first result
    const preferredTypes = ["room", "floor", "subpremise", "premise", "street_address",
      "bus_station", "train_station", "transit_station", "airport",
      "establishment", "point_of_interest", "natural_feature", "park", "parking"
    ];

    function getClosestAddress(addressResults, lnglat) {
      if (!addressResults || !Array.isArray(addressResults)) {
        return null;
      }

      const preferredResults = addressResults.filter(function (a) { return a.types.filter(function (t) { return preferredTypes.includes(t); }).length > 0; });
      const prefCount = preferredResults.length;
      if (prefCount === 0) {
        // nothing in the preferred list - so return the first result we got
        return addressResults[0];
      }
      if (prefCount === 1) {
        return preferredResults[0];
      } else {
        // Get the closest
        const preferredResult = preferredResults.sort(function (a, b) {
          const aDist = distance(a.geometry.location, lnglat);
          const bDist = distance(b.geometry.location, lnglat);
          if (aDist > bDist) return 1;
          if (aDist < bDist) return -1;
          return 0;
        })[0];

        return preferredResult;
      }
    }

    function geocode(lnglat, destArrayIndex) {
      var mStatus = gm.GeocoderStatus.OK;

      var pspr = !!permitScope ? permitScope.permit.permits.row : null;

      geocoder.geocode({ 'location': lnglat }, function (results, status) {
        mStatus = status;
        if (status === gm.GeocoderStatus.OK) {
          if (results.length > 0) {
            const result = getClosestAddress(results, lnglat).formatted_address;
            permitScope.$apply(function () { pspr.locationDescriptions[destArrayIndex].push(result); });
          } else {
            window.alert('Warning: No location results were returned by the Geocoder.  This is just a notice, you may still submit your application.');
          }
        } else {
          if (status !== gm.GeocoderStatus.OVER_QUERY_LIMIT) {
            window
              .alert('Warning: The Geocoder had problems getting a location result.  This is just a notice, you may still submit your application.  The Geocoder failed due to: ' + status);
          }
        }
      });

      return mStatus;
    }

    const handleGeoData = function (response) {
      // Una.gMap is the google maps object returned by Map.cshtml and Permit.cshtml
      $scope.geoData = $scope.geoData || {};
      $scope.geoData.geoFeatures = [];
      if (!!map) {
        $scope.geoData.geoFeatures = response.map(function (obj) { return obj.Feature; });
        var bbox = [200, 100, -200, -100];
        $scope.geoData.geoFeatures.forEach(function (feature) {
          map.data.addGeoJson(feature);
          bbox = setBboxBbox(bbox, feature.bbox);
        });

        map.fitBounds(createLatLngBounds(bbox));
      }
      //alert("Loaded GeoData Successfully");
    };

    function rebuildDrawingManager() {
      if (typeof (dm) !== "undefined" && dm !== null) {
        dmRebuilt = false;
      }

      dm = new gm.drawing.DrawingManager({
        drawingMode: null, // gm.drawing.OverlayType.POLYLINE,
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

      dmRebuilt = true;
    }

    function setBboxBbox(bbox, bboxNew) {
      if (bboxNew[0] < bbox[0]) {
        bbox[0] = bboxNew[0];
      }
      if (bboxNew[1] < bbox[1]) {
        bbox[1] = bboxNew[1];
      }
      if (bboxNew[2] > bbox[2]) {
        bbox[2] = bboxNew[2];
      }
      if (bboxNew[3] > bbox[3]) {
        bbox[3] = bboxNew[3];
      }

      return bbox;
    }

    function setBbox(bbox, lon, lat) {
      if (lon < bbox[0]) {
        bbox[0] = lon;
      }
      if (lat < bbox[1]) {
        bbox[1] = lat;
      }
      if (lon > bbox[2]) {
        bbox[2] = lon;
      }
      if (lat > bbox[3]) {
        bbox[3] = lat;
      }

      return bbox;
    }

    function createLatLngBounds(bbox) {
      return {
        west: bbox[0],
        south: bbox[1],
        east: bbox[2],
        north: bbox[3]
      };
    }

    function addEventListener() {
      if (dmRebuilt) {
        gm.event.addListener(dm,
          "polylinecomplete",
          function (pl) {
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
                polylineFeature.bbox = setBbox(polylineFeature.bbox, lon, lat);

                // Set the bbox for the entire featurecollection
                pspr.locations.bbox = setBbox(pspr.locations.bbox, lon, lat);

                //map.fitBounds(createLatLngBounds(pspr.locations.bbox));

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

        // Mark the drawing manager as no longer 'rebuilt'
        dmRebuilt = false;
      }
    }

    function resetMap() {
      rebuildDrawingManager();

      if (typeof (dm) === "undefined" || dm === null) {
        return;
      }

      //alert(JSON.stringify($scope.permit.permits.row.locations));

      // Clear the drawingmanager
      dm.setMap(null);
      dm.setMap(map);

      var pspr = $scope.permit.permits.row;
      // Clear the data (this impacts the fee calculation)
      pspr.distances.length = 0;
      pspr.totalDistance = 0;
      pspr.locations.features.length = 0;
      pspr.locationRoutes.length = 0;
      pspr.locationDescriptions.length = 0;

      // detach the polylines from the map first, then throw them all away
      $scope.map.locationPolylines.forEach(function (el) { el.setMap(null); });
      $scope.map.locationPolylines.length = 0;

      addEventListener();
    }

    function fitMap() {
      if (!!map) {
        map.fitBounds(createLatLngBounds(permitScope.permit.permits.row.locations.bbox));
      }
    }

    $scope.geoData = $scope.geoData || {};
    $scope.geoData.title = "geoDataController";
    //$scope.apiData = geoDataService.APIData;
    $scope.geoData.All = geoDataService.All().$promise.then(handleGeoData);
    $scope.geoData.IsDbConnected = geoDataService.IsDbConnected();
    $scope.geoData.ResetMap = resetMap;
    $scope.geoData.FitMap = fitMap;

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService"];
})(angular);
