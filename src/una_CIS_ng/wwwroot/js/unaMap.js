var Una = Una || {};

// ReSharper disable StringConcatenationToTemplateString

Una.Map = function (gm, mapElId) {
  const mapEl = document.getElementById(mapElId);

  var map = null;
  var geocoder = null;
  var infowindow = null;
  var drawingManager = null;
  var locDesc = [];
  const lgCode = "en-NG";
  const curCode = "NGN";

  // These are the address types we're after. 
  // If none of these are present then we'll fall back to just taking the first result
  const preferredTypes = ["room", "floor", "subpremise", "premise", "street_address",
    "bus_station", "train_station", "transit_station", "airport",
    "establishment", "point_of_interest", "natural_feature", "park", "parking"
  ];

  function getRate(elId) {
    const rateEl = document.getElementById(elId);
    return rateEl ? rateEl.value : 0;
  }

  function appendPolylinePath(ul, polylinePath, ll) {
    var li = null;
    if (ul) {
      polylinePath.forEach(function (el) {
        var lon = Number(Math.round(el.lng() + 'e7') + 'e-7');
        var lat = Number(Math.round(el.lat() + 'e7') + 'e-7');
        li = createElement("li", " Lon:" + lon.toFixed(7) + " Lat:" + lat.toFixed(7));
        ul.appendChild(li);

        var lnglat = { lng: parseFloat(lon.toFixed(7)), lat: parseFloat(lat.toFixed(7)) };
        var addr = geocodeLngLat(lnglat, ll);
      });
    }

    return li;
  }

  function appendPolylinePoints(ul, polylinePath) {
    var li = null;
    if (ul) {
      polylinePath.forEach(function (el) {
        const lon = Number(Math.round(el.lng() + 'e7') + 'e-7');
        const lat = Number(Math.round(el.lat() + 'e7') + 'e-7');
        li = createElement("li", " Lon:" + lon.toFixed(7) + " Lat:" + lat.toFixed(7));
        ul.appendChild(li);
      });
    }

    return li;
  }

  function appendPolylineDesc(ll, polylinePath) {
    if (ll) {
      polylinePath.forEach(function (el) {
        const lon = Number(Math.round(el.lng() + 'e7') + 'e-7');
        const lat = Number(Math.round(el.lat() + 'e7') + 'e-7');

        const lnglat = { lng: parseFloat(lon.toFixed(7)), lat: parseFloat(lat.toFixed(7)) };
        var addr = geocodeLngLat(lnglat, ll);
      });
    }
  }

  function appendDlDd(dl, dd) {
    var ddEl = null;
    if (dl) {
      ddEl = createElement("dd", dd);
      dl.appendChild(ddEl);
    }

    return ddEl;
  }

  function appendDlPair(dl, dt, dd) {
    var ddEl = null;
    if (dl) {
      const dtEl = createElement("dt", dt);
      dl.appendChild(dtEl);
      ddEl = appendDlDd(dl, dd);
    }

    return ddEl;
  }

  function appendHeading(dv, hd, hStyle) {
    var hdEl = null;
    if (!hStyle) {
      hStyle = "h5";
    }
    if (dv) {
      hdEl = createElement(hStyle, hd);
      dv.appendChild(hdEl);
    }

    return hdEl;
  }

  function createElement(tag, body) {
    const t = document.createElement(tag);
    const b = document.createTextNode(body);
    t.appendChild(b);

    return t;
  }

  function formatNairaStr(sourceVal) {
    return sourceVal.toLocaleString(lgCode,
      { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function geocodeLngLat(lnglat, ll) {
    var result = "";
    geocoder.geocode({ 'location': lnglat }, function (results, status) {
      if (status === gm.GeocoderStatus.OK) {
        if (results.length > 0) {
          if (ll) {
            result = getClosestAddress(results, lnglat).formatted_address;
            locDesc.push(result);

            var li = createElement("li", result);
            //var li = createElement("li", results[0].formatted_address);
            ll.appendChild(li);
          } else {
            var marker = new gm.Marker({
              position: lnglat,
              map: map
            });
            infowindow.setContent(results[0].formatted_address);
            infowindow.open(map, marker);
          }
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });

    return result;
  }

  function getClosestAddress(addressResults, lnglat) {
    if (!addressResults || !Array.isArray(addressResults)) {
      return null;
    }

    const preferredResults = addressResults.filter(function(a) { return a.types.filter(function(t){ return preferredTypes.includes(t); }).length > 0; });
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
      }
    });
    drawingManager.setMap(map);

    gm.event.addListener(drawingManager,
      "polylinecomplete",
      function (pl) {
        const plP = pl.getPath();
        const dist = Math.floor(gm.geometry.spherical.computeLength(plP));
        const distStr = dist.toLocaleString(lgCode, { maximumFractionDigits: 0 });
        const distkm = (dist / 1000).toLocaleString(lgCode, { maximumFractionDigits: 3 });

        //const ratePerM = getRate("RatePerM");
        //const rowTotal = Math.floor(dist * ratePerM);

        //const ratePerCp = getRate("RatePerCP");
        //const cpTotal = Math.floor(1 * ratePerCp);

        // Reset the location descriptions
        locDesc = [];

        const infLc = document.getElementById("location");
        if (infLc && permitScope) {
          const polylineFeature = { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [] }, "properties": {} };
          for (var ix = 0; ix < plP.getLength() ; ix++) {
            const pt = plP.getAt(ix);
            const lon = Number(Math.round(pt.lng() + 'e7') + 'e-7');
            const lat = Number(Math.round(pt.lat() + 'e7') + 'e-7');

            polylineFeature.geometry.coordinates.push([lon, lat]);
          }
          permitScope.$apply(function () { permitScope.permit.permits.row.locations.features.push(polylineFeature); });
          permitScope.$apply(function () { permitScope.permit.permits.row.locationDescriptions.push(locDesc); });
          permitScope.$apply(function () { permitScope.permit.permits.row.distances.push(dist); });
          permitScope.$apply(function() {
            permitScope.permit.permits.row.totalDistance = permitScope.permit.permits.row.distances.reduce(function (a, b) { return a + b; });
          });
          permitScope.$apply();
        }

        const infRt = document.getElementById("infRt");
        var infRtDesc = document.getElementById("infRtDesc");
        if (!infRtDesc) {
          infRtDesc = infRt;
        }
        if (infRt) {
          const rtDd = appendHeading(infRt, "Route of your infrastructure");
          const rtUl = infRt.appendChild(document.createElement("ul"));
          appendPolylinePoints(rtUl, plP);
          const rtDl = document.createElement("li");
          rtDl.text = "Distance: " + distStr + " m";
          if (dist > 1000) {
            appendDlDd(rtDl, distkm + " km");
          }

          const rtLd = appendHeading(infRtDesc, "Location of your infrastructure");
          const rtLl = infRtDesc.appendChild(document.createElement("ul"));
          appendPolylineDesc(rtLl, plP);

          //appendDlPair(infRt, "Right-of-Way fee", formatNairaStr(rowTotal));
          //appendDlPair(infRt, "Construction Permit fee", formatNairaStr(cpTotal));
          //appendDlPair(infRt, "Total fee", formatNairaStr(rowTotal + cpTotal));
        } else {
          var plList = "";
          plP.forEach(function (el) {
            var addr = geocodeLatLng(el);
            plList += el.toString() + " |||";
          });
          plList += "distance:" + dist;
          alert(plList);
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
    geocodeLngLat: geocodeLngLat
  };
};

