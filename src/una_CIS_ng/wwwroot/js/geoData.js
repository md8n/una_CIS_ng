var Una = Una || {};

// ReSharper disable StringConcatenationToTemplateString

Una.GeoData = function (gm, geoDataDbStatusId) {
  const geoDataDbStatusEl = document.getElementById(geoDataDbStatusId);

  if (!!geoDataDbStatusEl) {
    
  }
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

    gm.event.addListener(drawingManager,
      "polylinecomplete",
      function (pl) {
        const plP = pl.getPath();
        const dist = Math.floor(gm.geometry.spherical.computeLength(plP));
        const infRt = document.getElementById("infRt");
        if (infRt) {
          infRt.insertAdjacentHTML("beforeend", "<dt>Route of your infrastructure</dt>");
          const rtDd = infRt.appendChild(document.createElement("dd"));
          var rtUl = rtDd.appendChild(document.createElement("ul"));
          plP.forEach(function (el) {
            //var addr = geocodeLatLng(el, infowindow);
            rtUl.insertAdjacentHTML("beforeend", "<li>" + el.toString() + "</li>");
          });
          infRt.insertAdjacentHTML("beforeend", "<dt>Total Distance</dt>");
          const distStr = dist.toLocaleString(lgCode, { maximumFractionDigits: 0 });
          infRt.insertAdjacentHTML("beforeend", "<dd>" + distStr + " m</dd>");
          if (dist > 1000) {
            const distkm = (dist / 1000).toLocaleString(lgCode, { maximumFractionDigits: 3 });
            infRt.insertAdjacentHTML("beforeend", "<dd>" + distkm + " km</dd>");
          }

          const ratePerMEl = document.getElementById("RatePerM");
          const ratePerM = ratePerMEl.value;
          const rowTotal = Math.floor(dist * ratePerM);
          const rowTotalStr = rowTotal.toLocaleString(lgCode,
            { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });

          const ratePerCpEl = document.getElementById("RatePerCP");
          const ratePerCp = ratePerCpEl.value;
          const cpTotal = Math.floor(1 * ratePerCp);
          const cpTotalStr = cpTotal.toLocaleString(lgCode,
            { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });

          const gdTotalStr = (rowTotal + cpTotal).toLocaleString(lgCode,
            { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });

          infRt.insertAdjacentHTML("beforeend", "<dt>Right-of-Way fee</dt>");
          //infRt.insertAdjacentHTML("beforeend", `<dd><span style="text-decoration: line-through; text-align: right;">N</span> <span id="rowTotal">${rowTotal}</span></dd>`);
          infRt.insertAdjacentHTML("beforeend", "<dd>" + rowTotalStr + "</dd>");

          infRt.insertAdjacentHTML("beforeend", "<dt>Construction Permit fee</dt>");
          infRt.insertAdjacentHTML("beforeend", "<dd>" + cpTotalStr + "</dd>");

          infRt.insertAdjacentHTML("beforeend", "<dt>Total fee</dt>");
          infRt.insertAdjacentHTML("beforeend", "<dd>" + gdTotalStr + "</dd>");
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

