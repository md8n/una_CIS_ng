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
    geocoder.geocode({ 'location': lnglat }, function (results, status) {
      if (status === gm.GeocoderStatus.OK) {
        if (results.length > 0) {
          const result = getClosestAddress(results, lnglat).formatted_address;
          permitScope.$apply(function () { permitScope.permit.permits.row.locationDescriptions[destArrayIndex].push(result); });
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
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
          const polylineFeature = { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [] }, "properties": {} };
          var lonLats = [];
          permitScope.$apply(function () { permitScope.permit.permits.row.locationDescriptions.push([]); });
          permitScope.$apply(function () { permitScope.permit.permits.row.locationPolylines.push(pl); });
          var locDescCount = permitScope.permit.permits.row.locationDescriptions.length;
          for (var ix = 0; ix < plP.getLength() ; ix++) {
            const pt = plP.getAt(ix);
            const lon = Number(Math.round(pt.lng() + 'e7') + 'e-7');
            const lat = Number(Math.round(pt.lat() + 'e7') + 'e-7');

            lonLats.push([lon, lat]);
            polylineFeature.geometry.coordinates.push([lon, lat]);

            geocode({ lng: lon, lat: lat }, locDescCount - 1);
          }

          permitScope.$apply(function () { permitScope.permit.permits.row.locations.features.push(polylineFeature); });
          permitScope.$apply(function () { permitScope.permit.permits.row.locationRoutes.push(lonLats); });
          permitScope.$apply(function () { permitScope.permit.permits.row.distances.push(dist); });
          permitScope.$apply(function () {
            permitScope.permit.permits.row.totalDistance = permitScope.permit.permits.row.distances.reduce(function (a, b) { return a + b; });
          });
          permitScope.$apply();
        }
      });

    //function buildAddress(addressComponents, formattedAddress) {
    //  if (!addressComponents || !addressComponents.isArray) {
    //    return formattedAddress;
    //  }

    //}

    //  ////gm.event.addListener(drawingManager, 'overlaycomplete', function (event) {
    //  ////  if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
    //  ////    var plP = event.overlay.getPath();
    //  ////    alert('has plP');
    //  ////  }
    //  ////});

    //  //function loadKmlLayer(src, map) {
    //  //  var kmlLayer = new google.maps.KmlLayer(src, {
    //  //    clickable: false,
    //  //    suppressInfoWindows: false,
    //  //    preserveViewport: false
    //  //  });
    //  //  kmlLayer.setMap(map);
    //  //}

    //  //loadKmlLayer("@mapUrl", map);
  }

  return {
    map: map,
    drawingManager: drawingManager,
    infoWindow: infowindow,
    geocoder: geocoder,
    geocode: geocode
  };
};

