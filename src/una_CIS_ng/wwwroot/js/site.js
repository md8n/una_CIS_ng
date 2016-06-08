var Una = Una || {};

Una.Map = function (gm, mapElId) {
  var mapEl = document.getElementById(mapElId);

  var map;
  var geocoder;
  var infowindow;
  var drawingManager;
  const lgCode = "en-NG";
  const curCode = "NGN";

  if (!!gm && !!gm.Map) {
    map = new gm.Map(mapEl, {
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

    gm.event.addListener(drawingManager, "polylinecomplete", function (pl) {
      var plP = pl.getPath();
      var dist = Math.floor(gm.geometry.spherical.computeLength(plP));
      var infRt = document.getElementById("infRt");
      if (!!infRt) {
        infRt.insertAdjacentHTML("beforeend", "<dt>Route of your infrastructure</dt>");
        var rtDd = infRt.appendChild(document.createElement("dd"));
        var rtUl = rtDd.appendChild(document.createElement("ul"));
        plP.forEach(function (el, ix) {
          //var addr = geocodeLatLng(el, infowindow);
          rtUl.insertAdjacentHTML("beforeend", `<li>${el.toString()}</li>`);
        });
        infRt.insertAdjacentHTML("beforeend", "<dt>Total Distance</dt>");
        var distStr = dist.toLocaleString(lgCode, { maximumFractionDigits: 0 });
        infRt.insertAdjacentHTML("beforeend", `<dd>${distStr} m</dd>`);
        if (dist > 1000) {
          var distkm = (dist / 1000).toLocaleString(lgCode, { maximumFractionDigits: 3 });
          infRt.insertAdjacentHTML("beforeend", `<dd>${distkm} km</dd>`);
        }

        var ratePerMEl = document.getElementById("RatePerM");
        var ratePerM = ratePerMEl.value;
        var rowTotal = Math.floor(dist * ratePerM);
        var rowTotalStr = rowTotal.toLocaleString(lgCode, { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });

        var ratePerCpEl = document.getElementById("RatePerCP");
        var ratePerCp = ratePerCpEl.value;
        var cpTotal = Math.floor(1 * ratePerCp);
        var cpTotalStr = cpTotal.toLocaleString(lgCode, { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });

        var gdTotalStr = (rowTotal + cpTotal).toLocaleString(lgCode, { style: "currency", currency: curCode, minimumFractionDigits: 0, maximumFractionDigits: 0 });

        infRt.insertAdjacentHTML("beforeend", "<dt>Right-of-Way fee</dt>");
        //infRt.insertAdjacentHTML("beforeend", `<dd><span style="text-decoration: line-through; text-align: right;">N</span> <span id="rowTotal">${rowTotal}</span></dd>`);
        infRt.insertAdjacentHTML("beforeend", `<dd>${rowTotalStr}</span></dd>`);

        infRt.insertAdjacentHTML("beforeend", "<dt>Construction Permit fee</dt>");
        infRt.insertAdjacentHTML("beforeend", `<dd>${cpTotalStr}</dd>`);

        infRt.insertAdjacentHTML("beforeend", "<dt>Total fee</dt>");
        infRt.insertAdjacentHTML("beforeend", `<dd>${gdTotalStr}</dd>`);
      } else {
        var plList = "";
        plP.forEach(function (el, ix) {
          //var addr = geocodeLatLng(el, infowindow);
          plList += el.toString() + " |||";
        });
        plList += "distance:" + dist;
        alert(plList);
      }
    });

    function geocodeLatLng(latlng, iw) {
      var result = "";
      geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === gm.GeocoderStatus.OK) {
          if (results[1]) {
            iw.setContent(results[1].formatted_address);
            result = results[1].formatted_address;
          } else {
            result = "Could not determine address.";
          }
        } else {
          result = ("Geocoder failed due to: " + status);
        }
      });

      return result;
    }

    //gm.event.addListener(drawingManager, 'overlaycomplete', function (event) {
    //  if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
    //    var plP = event.overlay.getPath();
    //    alert('has plP');
    //  }
    //});

    function loadKmlLayer(src, map) {
      var kmlLayer = new google.maps.KmlLayer(src, {
        clickable: false,
        suppressInfoWindows: false,
        preserveViewport: false
      });
      kmlLayer.setMap(map);
    }

    //loadKmlLayer("@mapUrl", map);
  }
  return {
    map: map,
    drawingManager: drawingManager,
    infoWindow: infowindow,
    geocoder: geocoder,
    geocodeLatLng: geocodeLatLng
  };
}

