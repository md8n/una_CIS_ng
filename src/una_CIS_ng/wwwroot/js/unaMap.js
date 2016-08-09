var Una = Una || {};

// ReSharper disable StringConcatenationToTemplateString

Una.Map = function (gm, mapElId) {
  const mapEl = document.getElementById(mapElId);

  var map = null;
  var geocoder = null;
  var infowindow = null;
  var drawingManager = null;

  // These are the address types we're after. 
  // If none of these are present then we'll fall back to just taking the first result
  const preferredTypes = ["room", "floor", "subpremise", "premise", "street_address",
    "bus_station", "train_station", "transit_station", "airport",
    "establishment", "point_of_interest", "natural_feature", "park", "parking"
  ];

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

  // distance calc derived from www.geodatasource.com
  function distance(lonlat1, lonlat2) {
    const radlat1 = Math.PI * lonlat1.lat / 180;
    const radlat2 = Math.PI * lonlat2.lat / 180;
    const radtheta = Math.PI * (lonlat1.lng - lonlat2.lng) / 180;
    const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    // note: not interested in conversion to miles, Kms, Nms, etc.
    return Math.acos(dist) * (180 / Math.PI);
  }

  if (!!gm && !!gm.Map) {
    map = new gm.Map(mapEl,
    {
      center: { lng: 3.468163, lat: 6.520226 },
      zoom: 9
    });

    geocoder = new gm.Geocoder;
    infowindow = new gm.InfoWindow;

    drawingManager = new gm.drawing.DrawingManager({
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
    drawingManager.setMap(map);

    gm.event.addListener(drawingManager,
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

          var pspr = permitScope.permit.permits.row;

          var lonLats = [];
          permitScope.$apply(function () { pspr.locationDescriptions.push([]); });
          try {
            permitScope.$apply(function () { pspr.locationPolylines.push(pl); });
          } catch (e) { }
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

          permitScope.$apply(function () { pspr.locations.features.push(polylineFeature); });
          permitScope.$apply(function () { pspr.locationRoutes.push(lonLats); });
          permitScope.$apply(function () { pspr.distances.push(dist); });
          permitScope.$apply(function () {
            pspr.totalDistance = pspr.distances.reduce(function (a, b) { return a + b; });
          });
          permitScope.$apply();
        }
      });
  }

  return {
    map: map,
    drawingManager: drawingManager,
    infoWindow: infowindow,
    geocoder: geocoder,
    geocode: geocode
  };
};

