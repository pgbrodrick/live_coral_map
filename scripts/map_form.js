


var controllist = [];
var observed_bleaching_points = [];
var map;
var markers = [];
var infowindow;
var added_point;

var caogreen = 'rgb(0,152,58)';


function initialize_coral_map() {

var startBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(18.5,-160.5),
    new google.maps.LatLng(22.0,-154.5));
var mapMinZoom = 7;
var mapMaxZoom = 25;

    map = new google.maps.Map(document.getElementById("map_canvas"),{maxZoom: mapMaxZoom, minZoom:mapMinZoom, mapTypeId:'hybrid'});

    <!-- map.fitBounds(mapBounds); -->
    map.fitBounds(startBounds);

    downloadDiv = new AddPointDiv(map);
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(downloadDiv.div);

    observed_bleaching_points.push({position: new google.maps.LatLng(20.78839892, -156.56087586),dateinfo: "08/15/2019"})
    observed_bleaching_points.push({position: new google.maps.LatLng(20.88142837, -156.69040599),dateinfo: "08/15/2019"})
    observed_bleaching_points.push({position: new google.maps.LatLng(20.91575741, -156.69788421),dateinfo: "08/15/2019"})
    observed_bleaching_points.push({position: new google.maps.LatLng(19.87313644, -155.9220196),dateinfo: "08/18/2019"})

    infowindow = new google.maps.InfoWindow();

    // Event that closes the Info Window with a click on the map
    google.maps.event.addListener(map, 'click', function() {
       infoWindow.close();
    });

    // Create markers.
    for (var i = 0; i < observed_bleaching_points.length; i++) {
        add_marker(observed_bleaching_points[i].position, 'Date Recorded: ' + observed_bleaching_points[i].dateinfo, map, infowindow)
     };


        added_point = new google.maps.Marker({
         //icon: {
         //   path: google.maps.SymbolPath.CIRCLE,
         //   scale: 2,
         //   strokeColor: caogreen
         // },
         strokeColor: caogreen,
         draggable:true,
         //animation: google.maps.Animation.DROP,
         position: new google.maps.LatLng(19.0,-156),
         //position: results[0].geometry.location
         map: map
        });

        added_point.setMap(map);
        //added_point.addListener('bounds_changed', function(event) {
        //  area = getAreaHectares(global_rect);
        //  if ( area > 10000 ) {
        //    linecol = 'rgb(255,0,0)';
        //    fillcol = 'rgb(255,0,0)';
        //    if (!sizewarning) {
        //      alert("Area of selection is too large (>10,000 ha) to generate csv files - either adjust size until rectangle is green, or download the maps only.");
        //      sizewarning = true;
        //    }
        //    downloadDiv.activate();
        //    //downloadDiv.deactivate();
        //    downloadDiv.set_text('Download Maps');
        //    candownload = true;
        //    tiffonly = true;
        //  } else {
        //    sizewarning = false;
        //    linecol = caogreen;
        //    fillcol = caogreen;
        //    downloadDiv.activate();
        //    downloadDiv.set_text('Download Maps + CSVs');
        //    candownload = true;
        //    tiffonly = false;
        //  }
        //  global_rect.setOptions({
        //    fillColor: fillcol,
        //    fillOpacity: 0.1,
        //    strokeColor: linecol,
        //    strokeWeight: 3
        //  })
        //});
        //drawingManager.setDrawingMode();



}


function add_marker(latlong, content_str, map, infowindow){
    var marker = new google.maps.Marker({
         position: latlong,
         icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 2,
            strokeColor: '#C93211'
          },
         map: map
       });

       google.maps.event.addListener(marker, 'click', function() {

       var iwContent =  content_str;
         infowindow.setContent(content_str);
         infowindow.open(map, marker);
        });
     markers.push(marker)
}



function selectControl(item) {
    clearMap();
    if (item == 0) {pointOverlay();}
    else if (item == 1) {pointHeatOverlay();}
    else if (item == 2) {satHeatOverlay();}

    for (i = 0; i < controllist.length; i++ ) {
      controllist[i].deselect();
    }
    controllist[item].select();
}



function OverlayControl(controlDiv, map, id, dispTxt) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor ='#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Select Coverage layer';
  controlDiv.appendChild(controlUI);
  this.controlUI = controlUI;

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '28px';
  controlText.style.paddingLeft = '2px';
  controlText.style.paddingRight = '2px';
  controlText.style.paddingUp = '2px';
  controlText.style.paddingDown = '2px';
  controlText.innerHTML = dispTxt;
  controlUI.appendChild(controlText);
  this.controlText = controlText;

  // Setup the click event listeners: simply set the map to Chicago.
  this.controlUI.addEventListener('click', function() {
    selectControl(id);
  });
}
function OverlayDiv(map, id, dispTxt) {
  this.div = document.createElement('div');
  this.div.index = 1;
  this.control = new OverlayControl(this.div, map, id, dispTxt);
}
OverlayDiv.prototype.select = function() {
  this.control.controlText.style.color = caogreen;
}
OverlayDiv.prototype.deselect = function() {
  this.control.controlText.style.color = 'rgb(25,25,25)';
}

function SelectionControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor ='#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Select Coverage layer';
  controlDiv.appendChild(controlUI);
  this.controlUI = controlUI;

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '28px';
  controlText.style.paddingLeft = '2px';
  controlText.style.paddingRight = '2px';
  controlText.style.paddingUp = '2px';
  controlText.style.paddingDown = '2px';
  controlText.innerHTML = 'Select Area';
  controlUI.appendChild(controlText);
  this.controlText = controlText;

  // Setup the click event listeners
  this.controlUI.addEventListener('click', function() {
    if (!drawing) {
      drawingManager.setDrawingMode('rectangle');
      //selectionDiv.deactivate();
      drawing = true;
    } else {
      drawingManager.setDrawingMode();
      selectionDiv.activate();
      drawing = false;
    }
  });
}
function SelectionDiv(map) {
  this.div = document.createElement('div');
  this.div.index = 1;
  this.control = new SelectionControl(this.div, map);
}
SelectionDiv.prototype.activate = function() {
  this.control.controlText.style.color = caogreen;
}
SelectionDiv.prototype.deactivate = function() {
  this.control.controlText.style.color = 'rgb(225,225,225)';
}


function AddPointControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor ='#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Select Coverage layer';
  controlDiv.appendChild(controlUI);
  this.controlUI = controlUI;

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = caogreen;
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '28px';
  //controlText.style.paddingLeft = '10px';
  //controlText.style.paddingRight = '10px';
  controlText.style.width = '200px';
  controlText.style.paddingUp = '2px';
  controlText.style.paddingDown = '2px';
  controlText.innerHTML = 'Populate Coordinates';
  controlUI.appendChild(controlText);
  this.controlText = controlText;

  // Setup the click event listener
  this.controlUI.addEventListener('click', function() {
    show_form()
  });
}

function show_form(){
  var x = document.getElementById("formDiv");
  x.style.display = "block";

  document.getElementById("latitude").value = added_point.getPosition().lat();
  document.getElementById("longitude").value = added_point.getPosition().lng();
  document.getElementById("submission_button").addEventListener("click",function(){submit_form()});
  launch_record_script(added_point.getPosition().lat(), added_point.getPosition().lng())
}


function launch_record_script(lat, lng) {
   $.getJSON( '/_record_image',{
     lat: lat,
     lng: lng,
 }, function (data) {
    if (data.error_string == '') {
      alert('Your point has been added!  Please be patient, it will display on the map shortly.');
    }
    else {
      alert('Unfortunately, your data point is outside of the bounds of live coral events.  Please re-check the location')
    }

 });
}




function submit_form() {
    document.getElementById("post_submission_text").style.display="block";
}

function AddPointDiv(map) {
  this.div = document.createElement('div');
  this.div.index = 1;
  this.control = new AddPointControl(this.div, map);
}
AddPointDiv.prototype.activate = function() {
  this.control.controlText.style.color = caogreen;
}
AddPointDiv.prototype.deactivate = function() {
  this.control.controlText.style.color = 'rgb(222,225,225)';
}


AddPointDiv.prototype.set_text = function(text) {
  this.control.controlText.innerHTML = text;
}





