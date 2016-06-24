var Una = Una || {};

// ReSharper disable StringConcatenationToTemplateString

Una.Map = function (gm, mapElId) {
  const mapEl = document.getElementById(mapElId);

  var map = null;
  var geocoder = null;
  var infowindow = null;
  var drawingManager = null;
  const lgCode = "en-NG";
  const curCode = "NGN";

  // These are the address types we're after. 
  // If none of these are present then we'll fall back to just taking the first result
  const preferredTypes = ["room", "floor", "subpremise", "premise", "street_address",
    "bus_station", "train_station", "transit_station", "airport",
    "establishment", "point_of_interest", "natural_feature", "park", "parking"
  ];

  if (!!gm && !!gm.Map) {
    map = new gm.Map(mapEl,
    {
      center: { lat: 6.520226, lng: 3.468163 }, // 6.520226, 3.468163
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

    function getRate(elId) {
      const rateEl = document.getElementById(elId);
      return (rateEl) ? rateEl.value : 0;
    }

    function appendPolylinePath(ul, polylinePath, ll) {
      var li = null;
      if (ul) {
        polylinePath.forEach(function (el) {
          var lat = Number(Math.round(el.lat() + 'e7') + 'e-7');
          var lon = Number(Math.round(el.lng() + 'e7') + 'e-7');
          li = createElement("li", "Lat:" + lat.toFixed(7) + " Lon:" + lon.toFixed(7));
          ul.appendChild(li);

          var latlng = { lat: parseFloat(lat.toFixed(7)), lng: parseFloat(lon.toFixed(7)) };
          var addr = geocodeLatLng(latlng, ll);
        });
      }

      return li;
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

    gm.event.addListener(drawingManager,
      "polylinecomplete",
      function (pl) {
        const plP = pl.getPath();
        const dist = Math.floor(gm.geometry.spherical.computeLength(plP));
        const distStr = dist.toLocaleString(lgCode, { maximumFractionDigits: 0 });
        const distkm = (dist / 1000).toLocaleString(lgCode, { maximumFractionDigits: 3 });

        const ratePerM = getRate("RatePerM");
        const rowTotal = Math.floor(dist * ratePerM);

        const ratePerCp = getRate("RatePerCP");
        const cpTotal = Math.floor(1 * ratePerCp);

        const infRt = document.getElementById("infRt");
        if (infRt) {
          const rtDd = appendDlPair(infRt, "Route of your infrastructure", "");
          const rtUl = rtDd.appendChild(document.createElement("ul"));
          const rtLd = appendDlPair(infRt, "Location of your infrastructure", "");
          const rtLl = rtLd.appendChild(document.createElement("ul"));
          appendPolylinePath(rtUl, plP, rtLl);

          appendDlPair(infRt, "Total Distance", distStr + " m");
          if (dist > 1000) {
            appendDlDd(infRt, distkm + " km");
          }

          appendDlPair(infRt, "Right-of-Way fee", formatNairaStr(rowTotal));
          appendDlPair(infRt, "Construction Permit fee", formatNairaStr(cpTotal));
          appendDlPair(infRt, "Total fee", formatNairaStr(rowTotal + cpTotal));
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

    function geocodeLatLng(latlng, ll) {
      var result = "";
      geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === gm.GeocoderStatus.OK) {
          if (results.length > 0) {
            if (ll) {
              var li = createElement("li", getClosestAddress(results, latlng).formatted_address);
              ll.appendChild(li);
            } else {
              var marker = new gm.Marker({
                position: latlng,
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

    function getClosestAddress(addressResults, latlng) {
      if (!addressResults || !Array.isArray(addressResults)) {
        return null;
      }

      const preferredResults = addressResults.filter(a => a.types.filter(t => preferredTypes.includes(t)).length > 0);
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
          const aDist = distance(a.geometry.location, latlng);
          const bDist = distance(b.geometry.location, latlng);
          if (aDist > bDist) return 1;
          if (aDist < bDist) return -1;
          return 0;
        })[0];

        return preferredResult;
      }
    }

    function buildAddress(addressComponents, formattedAddress) {
      if (!addressComponents || !addressComponents.isArray) {
        return formattedAddress;
      }

    }

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

    // distance calc derived from www.geodatasource.com
    function distance(latlon1, latlon2) {
      const radlat1 = Math.PI * latlon1.lat / 180;
      const radlat2 = Math.PI * latlon2.lat / 180;
      const radtheta = Math.PI * (latlon1.lng - latlon2.lng) / 180;
      const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      // note: not interested in conversion to miles, Kms, Nms, etc.
      return Math.acos(dist) * (180 / Math.PI);
    }
  }

  return {
    map: map,
    drawingManager: drawingManager,
    infoWindow: infowindow,
    geocoder: geocoder,
    geocodeLatLng: geocodeLatLng
  };
};

