(function (angular) {
  //"use strict";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("geoDataController", ["$scope", "$rootScope", "geoDataService", geoDataController]);

  function geoDataController($scope, $rootScope, geoDataService) {
    var gm = null;
    var geocoder = null;
    var map = null;
    var dm = null;
    var dmRebuilt = false;
    var didFit = false;

    // Set up the basic bits for geoData
    $scope.geoData = $scope.geoData || {};
    $scope.geoData.title = "geoDataController";

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
      var uMap = unaMap("map");
      //Una.gMap = unaMap.map;
      //Una.dm = unaMap.drawingManager;
      //alert("Una loaded:" + !!Una + " map loaded:" + !!Una.gMap + " DrawingManager loaded:" + !!Una.dm);
    };
    var initMap = function () {
      $scope.initMap();
    }
    window.initMap = initMap;

    // distance calc derived from www.geodatasource.com
    function distance(lonlat1, lonlat2) {
      var radlat1 = Math.PI * lonlat1.lat / 180;
      var radlat2 = Math.PI * lonlat2.lat / 180;
      var radtheta = Math.PI * (lonlat1.lng - lonlat2.lng) / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      // note: not interested in conversion to miles, Kms, Nms, etc.
      return Math.acos(dist) * (180 / Math.PI);
    }

    // These are the address types we're after. 
    // If none of these are present then we'll fall back to just taking the first result
    var preferredTypes = ["room", "floor", "subpremise", "premise", "street_address",
      "bus_station", "train_station", "transit_station", "airport",
      "establishment", "point_of_interest", "natural_feature", "park", "parking"
    ];

    function getClosestAddress(addressResults, lnglat) {
      if (!addressResults || !Array.isArray(addressResults)) {
        return null;
      }

      var preferredResults = addressResults.filter(function (a) { return a.types.filter(function (t) { return preferredTypes.includes(t); }).length > 0; });
      var prefCount = preferredResults.length;
      if (prefCount === 0) {
        // nothing in the preferred list - so return the first result we got
        return addressResults[0];
      }
      if (prefCount === 1) {
        return preferredResults[0];
      } else {
        // Get the closest
        var preferredResult = preferredResults.sort(function (a, b) {
          var aDist = distance(a.geometry.location, lnglat);
          var bDist = distance(b.geometry.location, lnglat);
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
            var result = getClosestAddress(results, lnglat).formatted_address;
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

    var handleGeoData = function (response) {
      // Una.gMap is the google maps object returned by Map.cshtml and Permit.cshtml
      $scope.geoData = $scope.geoData || {};
      $scope.geoData.geoFeatures = [];
      if (!!map) {
        $scope.geoData.geoFeatures = response.map(function (obj) { return obj.Feature; });
        $scope.geoData.geoFeatures.forEach(function (feature) {
          map.data.addGeoJson(feature);
        });
        fitMap();
      }
    };

    function rebuildDrawingManager() {
      if (typeof (dm) !== "undefined" && dm !== null) {
        // Clear the drawingmanager
        dm.setMap(null);
        dm.setMap(map);

        dmRebuilt = false;
        return;
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

      dm.setMap(map);

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

    function getLatLngCenter(bbox) {
      return { "lng": (bbox[0] + bbox[2]) / 2, "lat": (bbox[1] + bbox[3]) / 2 };
    }

    function addEventListener() {
      if (dmRebuilt) {
        // Add a listener for when we've finished drawing a polyline
        gm.event.addListener(dm,
          "polylinecomplete",
          function (pl) {
            var plP = pl.getPath();
            var dist = Math.floor(gm.geometry.spherical.computeLength(plP));

            var infLc = document.getElementById("location");
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
                var pt = plP.getAt(ix);
                var lon = Number(Math.round(pt.lng() + 'e7') + 'e-7');
                var lat = Number(Math.round(pt.lat() + 'e7') + 'e-7');

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

        // Add a listener for when resize has occurred
        gm.event.addListener(map, 'resize', function () {
          map.fitBounds(createLatLngBounds(getCurrentBBox()));
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

      fitMap();

      addEventListener();
    }

    // Allow fitMap to be callable by other controllers
    $rootScope.$on("GeoDataFitMap", function () { fitMap(); });

    function fitMap() {
      if (!!map && ($scope.permit.permits.row.totalDistance > 0 || !!$scope.geoData.geoFeatures)) {
        map.fitBounds(createLatLngBounds(getCurrentBBox()));
      }
    }

    function getCurrentBBox() {
      var pspr = $scope.permit.permits.row;

      var bbox = [200, 100, -200, -100];

      if (pspr.totalDistance > 0) {
        bbox = pspr.locations.bbox;
        didFit = true;
      } else {
        $scope.geoData.geoFeatures.forEach(function (feature) {
          bbox = setBboxBbox(bbox, feature.bbox);
        });
      }

      return bbox;
    }

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
