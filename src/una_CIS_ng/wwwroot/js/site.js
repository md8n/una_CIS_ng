﻿var Una = Una || {};

// ReSharper disable StringConcatenationToTemplateString

Una.Map = function (gm, mapElId) {
  const mapEl = document.getElementById(mapElId);

  var map = null;
  var geocoder = null;
  var infowindow = null;
  var drawingManager = null;
  const lgCode = "en-NG";
  const curCode = "NGN";

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

    function appendPolylinePath(ul, polylinePath) {
      var li = null;
      if (ul) {
        polylinePath.forEach(function (el) {
          li = createElement("li", el.toString());
          //var addr = geocodeLatLng(el, infowindow);
          ul.appendChild(li);
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
      return document.createElement("<" + tag + ">" + body + "</" + tag + ">");
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
          appendPolylinePath(rtUl, plP);

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
            //var addr = geocodeLatLng(el, infowindow);
            plList += el.toString() + " |||";
          });
          plList += "distance:" + dist;
          alert(plList);
        }
      });

    //  //function geocodeLatLng(latlng, iw) {
    //  //  var result = "";
    //  //  geocoder.geocode({ 'location': latlng }, function (results, status) {
    //  //    if (status === gm.GeocoderStatus.OK) {
    //  //      if (results[1]) {
    //  //        iw.setContent(results[1].formatted_address);
    //  //        result = results[1].formatted_address;
    //  //      } else {
    //  //        result = "Could not determine address.";
    //  //      }
    //  //    } else {
    //  //      result = ("Geocoder failed due to: " + status);
    //  //    }
    //  //  });

    //  //  return result;
    //  //}

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
    geocodeLatLng: geocodeLatLng
  };
};

