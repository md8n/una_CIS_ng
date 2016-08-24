(function (angular) {
  //"use strict";

  angular
    .module("unaApp") // defined in unaApp.js
    .controller("geoDataController", ["$scope", "$rootScope", "geoDataService", "permitService", "penaltyService", geoDataController]);

  function geoDataController($scope, $rootScope, geoDataService, permitService, penaltyService) {
    var gm = null;
    var geocoder = null;
    var map = null;
    var dm = null;
    var dmRebuilt = false;
    var sb = null;
    var didFit = false;

    var pageService = null;
    var pageScope = null;
    var pageData = null;

    // Set up the basic bits for geoData
    $scope.geoData = $scope.geoData || {};
    $scope.geoData.title = "geoDataController";
    $scope.geoData.markers = [];

    function unaMap(mapElId) {
      gm = google.maps;
      geocoder = new gm.Geocoder;

      if (!!gm && !!gm.Map) {
        var mapEl = document.getElementById(mapElId);
        map = new gm.Map(mapEl,
        {
          center: { lat: 6.520226, lng: 3.468163 }, // 6.520226, 3.468163
          zoom: 9,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        });

        //infowindow = new gm.InfoWindow;

        if (mapEl.hasAttribute("permit")) {
          pageService = permitService;
          pageScope = permitScope;
          pageData = pageScope.permit.permits.row;
        } else if (mapEl.hasAttribute("penalty")) {
          pageService = penaltyService;
          pageScope = penaltyScope;
          pageData = pageScope.penalty.infringing;
        }

        resetMap(mapEl.hasAttribute("showdrawingcontrols"));
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
    var preferredTypes = [
      "room", "floor", "subpremise", "premise", "street_address",
      "bus_station", "train_station", "transit_station", "airport",
      "establishment", "point_of_interest", "natural_feature", "park", "parking"
    ];

    function getClosestAddress(addressResults, lnglat) {
      if (!addressResults || !Array.isArray(addressResults)) {
        return null;
      }

      var preferredResults = addressResults.filter(function (a) {
        return a.types.filter(function (t) { return preferredTypes.includes(t); }).length > 0;
      });
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

      geocoder.geocode({ 'location': lnglat },
        function (results, status) {
          mStatus = status;
          if (status === gm.GeocoderStatus.OK) {
            if (results.length > 0) {
              var result = getClosestAddress(results, lnglat).formatted_address;
              pageScope.$apply(function () { pageData.locationDescriptions[destArrayIndex].push(result); });
            } else {
              window
                .alert('Warning: No location results were returned by the Geocoder.  This is just a notice, you may still submit your application.');
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
      // map is the google maps object returned by Map.cshtml, Permit.cshtml, Penalty.cshtml
      $scope.geoData = $scope.geoData || {};
      $scope.geoData.geoFeatures = [];
      if (!!map) {
        if (Array.isArray(response) && response.length > 0) {
          if (response[0].hasOwnProperty("Feature")) {
            $scope.geoData.geoFeatures = response.map(function (obj) { return obj.Feature; });
          } else if (response[0].hasOwnProperty("FeatureCollection")) {
            $scope.geoData.geoFeatures = response.map(function (obj) {
              if (typeof (obj.FeatureCollection) === "string") {
                obj.FeatureCollection = JSON.parse(obj.FeatureCollection);
              }
              return obj.FeatureCollection;
            });
          }
        }
        map.data.setStyle({ strokeColor: 'darkred', strokeWeight: 1, strokeOpacity: 0.7 });
        $scope.geoData.geoFeatures.forEach(function (feature) {
          map.data.addGeoJson(feature);
        });

        //fitMap();
      }
    };

    function rebuildDrawingManager(showDrawingControls) {
      showDrawingControls = !!showDrawingControls;

      if (typeof (dm) !== "undefined" && dm !== null) {
        // Clear the drawingmanager
        dm.setMap(null);
        dm.setMap(map);

        dmRebuilt = false;
        return;
      }

      if (!!dm) {
        // Clear the drawingmanager first
        dm.setMap(null);
      }

      dm = new gm.drawing.DrawingManager({
        drawingMode: null, // gm.drawing.OverlayType.POLYLINE,
        drawingControl: showDrawingControls,
        drawingControlOptions: {
          position: gm.ControlPosition.RIGHT_TOP,
          drawingModes: [
            gm.drawing.OverlayType.POLYLINE
          ]
        },
        polyLineOptions: {
          editable: showDrawingControls
        }
      });

      dm.setMap(map);

      dmRebuilt = true;
    }

    function rebuildSearchBox(showDrawingControls) {
      showDrawingControls = !!showDrawingControls;

      var inpEl = document.getElementById("pac-input");
      if (typeof (inpEl) === "undefined" || inpEl === null) {
        return;
      }
      sb = new gm.places.SearchBox(inpEl);
      map.controls[gm.ControlPosition.TOP_CENTER].push(inpEl);

      // Bias the SearchBox results towards current map's viewport.
      gm.event.addListener(map, 'bounds_changed', function () {
        sb.setBounds(map.getBounds());
      });

      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      sb.addListener('places_changed', function () {
        var places = sb.getPlaces();

        if (places.length === 0) {
          return;
        }

        // Clear out the old markers.
        $scope.geoData.markers.forEach(function (marker) {
          marker.setMap(null);
        });
        $scope.geoData.markers = [];

        // For each place, get the icon, name and location.
        var bounds = new gm.LatLngBounds();
        places.forEach(function (place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new gm.Size(71, 71),
            origin: new gm.Point(0, 0),
            anchor: new gm.Point(17, 34),
            scaledSize: new gm.Size(25, 25)
          };

          // Create a marker for each place.
          $scope.geoData.markers.push(new gm.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
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
        // Add a listener for when we've finished drawing a polyline
        gm.event.addListener(dm,
          "polylinecomplete",
          function (pl) {
            var plP = pl.getPath();
            var dist = Math.floor(gm.geometry.spherical.computeLength(plP));

            if (dist === 0) {
              alert("Single points cannot be used to show your infrastructure route.  Please try again");
              return;
            }

            var infLc = document.getElementById("location");
            if (infLc && pageScope) {
              // Set up a polyline feature - note the deliberately wrong initial values for bbox
              var polylineFeature = {
                "type": "Feature",
                "bbox": [200, 100, -200, -100],
                "geometry": { "type": "LineString", "coordinates": [] },
                "properties": {}
              };
              var lonLats = [];
              pageData.locationDescriptions.push([]);
              var locDescCount = pageData.locationDescriptions.length;
              for (var ix = 0; ix < plP.getLength() ; ix++) {
                var pt = plP.getAt(ix);
                var lon = Number(Math.round(pt.lng() + 'e7') + 'e-7');
                var lat = Number(Math.round(pt.lat() + 'e7') + 'e-7');

                lonLats.push([lon, lat]);
                polylineFeature.geometry.coordinates.push([lon, lat]);

                // Set this feature's bbox
                polylineFeature.bbox = setBbox(polylineFeature.bbox, lon, lat);

                // Set the bbox for the entire featurecollection
                pageData.locations.bbox = setBbox(pageData.locations.bbox, lon, lat);

                setTimeout(function (lon, lat, locDescCount) {
                  var mStatus = geocode({ lng: lon, lat: lat }, locDescCount - 1);
                  if (mStatus == gm.GeocoderStatus.OVER_QUERY_LIMIT) {
                    alert('Warning: The Geocoder had problems getting a particular location result.  This is just a notice, you may still submit your application.');
                  }
                },
                  200 * ix,
                  lon,
                  lat,
                  locDescCount);
              }

              pageData.locations.features.push(polylineFeature);
              pageData.locationRoutes.push(lonLats);
              pageData.distances.push(dist);
              pageData.totalDistance = pageData.distances.reduce(function (a, b) { return a + b; });

              pageScope.map.locationPolylines.push(pl);
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

    function resetMap(showDrawingControls) {
      showDrawingControls = !!showDrawingControls;

      rebuildDrawingManager(showDrawingControls);
      rebuildSearchBox(showDrawingControls);

      if (typeof (dm) === "undefined" || dm === null) {
        return;
      }

      //geoDataService.All().$promise.then(handleGeoData);
      pageService.GeoData().$promise.then(handleGeoData);

      //alert(JSON.stringify(pageData.locations));

      if (!!pageScope) {
        // Clear the data (this impacts the fee calculation)
        pageData.distances.length = 0;
        pageData.totalDistance = 0;
        pageData.locations.features.length = 0;
        pageData.locationRoutes.length = 0;
        pageData.locationDescriptions.length = 0;

        // detach the polylines from the map first, then throw them all away
        $scope.map.locationPolylines.forEach(function (el) { el.setMap(null); });
        $scope.map.locationPolylines.length = 0;
      }

      if (showDrawingControls) {
        addEventListener();
      }
    }

    // Allow handleGeoData to be callable by other controllers
    $rootScope.$on("GeoDataHandleGeoData", function () { handleGeoData(); });

    // Allow fitMap to be callable by other controllers
    $rootScope.$on("GeoDataFitMap", function () { fitMap(); });

    function fitMap() {
      if (!!map && ((!!pageData && pageData.totalDistance > 0) || !!$scope.geoData.geoFeatures)) {
        map.fitBounds(createLatLngBounds(getCurrentBBox()));
      }
    }

    function getCurrentBBox() {
      var pspr = !!pageData ? pageData : { "totalDistance": 0 };

      var bbox = (pspr.totalDistance > 0) ? pspr.locations.bbox : [2.705989, 6.375578, 4.351192, 6.430167];

      if (pspr.totalDistance > 0) {
        didFit = true;
      }

      return bbox;
    }

    //$scope.apiData = geoDataService.APIData;
    //$scope.geoData.All = geoDataService.All().$promise.then(handleGeoData);
    $scope.geoData.IsDbConnected = geoDataService.IsDbConnected();
    $scope.geoData.ResetMap = resetMap;
    $scope.geoData.FitMap = fitMap;

    //activate();

    //function activate() { }
  }

  geoDataController.$inject = ["$scope", "geoDataService", "permitService", "penaltyService"];
})(angular);
