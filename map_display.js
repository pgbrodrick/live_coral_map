


var controllist = [];
var observed_bleaching_points = [];
var map;
var pointHeatmap;
var satHeatmap;
var markers = [];
var infowindow;


function initialize_coral_map() {

var startBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(18.5,-160.5),
    new google.maps.LatLng(22.0,-154.5));
var mapMinZoom = 7;
var mapMaxZoom = 25;


    map = new google.maps.Map(document.getElementById("map_canvas"),{maxZoom: mapMaxZoom, minZoom:mapMinZoom, mapTypeId:'hybrid'});

    <!-- map.fitBounds(mapBounds); -->
    map.fitBounds(startBounds);


    var pointControlDiv = new OverlayDiv(map, 0, "Observed Points");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(pointControlDiv.div);

    var pointHeatControlDiv = new OverlayDiv(map, 1, "Point Heatmap");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(pointHeatControlDiv.div);

    var satHeatControlDiv = new OverlayDiv(map, 2, "Satellite Heatmap");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(satHeatControlDiv.div);

    controllist = [ pointControlDiv, pointHeatControlDiv, satHeatControlDiv];


	//var returnValue = "";
	//var request = new XMLHttpRequest();
    //request.open("GET", "data_points.csv", false);
    //document.write("hi")
	//request.send(null);
	//returnValue = request.responseText;
    //var data = CSVToArray(returnValue);

    //var observed_bleaching_points = []
    //for (var index = 0; index < data.length; index++)
    //{
    //    var ll = new google.maps.LatLng(parseFloat(data[i][0]), parseFloat(data[i][1]))
    //    observed_bleaching_points.push({position: ll, dateinfo: data[i][2]})
    //}

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


    // Create point marker Heatmap
    var pointHeatmapData = [];
    for (var i = 0; i < observed_bleaching_points.length; i++) {
        pointHeatmapData.push(observed_bleaching_points[i].position);
    }
    pointHeatmap = new google.maps.visualization.HeatmapLayer({data: pointHeatmapData});
    pointHeatmap.setMap(map);

    // Create satelite marker Heatmap
    var satHeatmapData = [];
    for (var i = 0; i < observed_bleaching_points.length; i++) {
        satHeatmapData.push(observed_bleaching_points[i].position);
    }
    satHeatmap = new google.maps.visualization.HeatmapLayer({data: satHeatmapData});
    satHeatmap.setMap(map);


    // Set initial control
    selectControl(0);
}


function clearMap(){
    for (var i=0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    pointHeatmap.set('opacity',0)
    satHeatmap.set('opacity',0)
}

function pointOverlay(){
    for (var i = 0; i < markers.length; i++) {
       markers[i].setMap(map);
    }
}

function pointHeatOverlay(){
    pointHeatmap.set('opacity',1)
}

function satHeatOverlay(){
    satHeatmap.set('opacity',1)
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
  this.control.controlText.style.color = 'rgb(0,152,58)';
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
  this.control.controlText.style.color = 'rgb(0,152,58)';
}
SelectionDiv.prototype.deactivate = function() {
  this.control.controlText.style.color = 'rgb(225,225,225)';
}


