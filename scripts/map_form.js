


var controllist = [];
var observed_bleaching_points = [];
var map;
var markers = [];
var infowindow;
var report_point;
var nodata_marker;
var nodata_info;
var pointHeatmap;
var satHeatmap;

var caogreen = 'rgb(0,152,58)';


function initialize_coral_map() {

    var startBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(18.5,-160.5),
    new google.maps.LatLng(22.0,-154.5));
    var mapMinZoom = 7;
    var mapMaxZoom = 25;

    map = new google.maps.Map(document.getElementById("map_canvas"),
	    		      {maxZoom: mapMaxZoom, 
			       minZoom:mapMinZoom, 
			       mapTypeId:'hybrid', 
			       mapTypeControlOptions: {position: google.maps.ControlPosition.LEFT_BOTTOM, 
				                       style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
			       zoomControlOptions: {
					             position: google.maps.ControlPosition.LEFT_CENTER
					           },
			       fullscreenControlOptions: {
					             position: google.maps.ControlPosition.LEFT_CENTER
					           },
			      streetViewControl: false
			      });

    map.fitBounds(startBounds);

    addpointDiv = new AddPointDiv(map);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(addpointDiv.div);

    var pointControlDiv = new OverlayDiv(map, 0, "Bleaching Observations");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(pointControlDiv.div);

    var satHeatControlDiv = new OverlayDiv(map, 1, "Satellite Update");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(satHeatControlDiv.div);

    controllist = [ pointControlDiv, satHeatControlDiv];

    satHeatmap = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(200,100)], maxIntensity: 800, radius: 10});
    initialize_sat_heatmap();

    pointHeatmap = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(200,100)]});

    launch_read_script();

    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(map, 'click', function() {infoWindow.close();});


    nodata_marker = new google.maps.Marker({
	        position: map.getCenter(),
	        map: map,
	        visible: false
    });

    /* Center change handler to always center the marker */
    map.addListener('center_changed', function() {nodata_marker.setPosition(map.getCenter());});
    nodata_info = new google.maps.InfoWindow({content: "NO BLEACHING DETECTED BY OUR SATELLITES YET"});


    //// Try HTML5 geolocation.
    //if (navigator.geolocation) {

    //  mylocationdiv = new MyLocationDiv(map);
    //  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(mylocationdiv.div);
    //} 


    // Create output marker
    report_point = new google.maps.Marker({
     draggable:true,
     position: new google.maps.LatLng(20.0,-158),
     map: map
    });

    report_point.setMap(map);
    google.maps.event.addListener(report_point,'dragend',function(){update_latlong(report_point.getPosition().lat(),report_point.getPosition().lng())});
    google.maps.event.addListener(map, 'idle', function() {keep_marker_centered()});
    document.getElementById("submission_button").addEventListener("click",function(){submit_form()});
    document.getElementById("bleaching-info").addEventListener("click",function(){get_bleaching_info()});

    selectControl(0);
}

function get_bleaching_info(){
   var div = document.getElementById("bleaching-detail");
   if (div.style.display == 'none') {
        div.style.display = 'block';
   }
   else {
        div.style.display = 'none';
   }
}



function add_marker(point_info, map, infowindow){

    if (point_info.recorder == 'expert') {
    var marker = new google.maps.Marker({
         position: point_info.position,
         icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 2,
            strokeColor: '#C93211'
          },
         map: map
       });

       google.maps.event.addListener(marker, 'click', function() {

       var iwContent =  'Date Recorded: ' + point_info.dateinfo;
         infowindow.setContent(iwContent);
         infowindow.open(map, marker);
        });
     markers.push(marker)
    }
}

function keep_marker_centered(){
             var bounds = map.getBounds();
             var ne = bounds.getNorthEast();
             var sw = bounds.getSouthWest();
             //do whatever you want with those bounds

	     var mlat = report_point.getPosition().lat();
	     var mlng = report_point.getPosition().lng();
	     var newlat = mlat;
	     var newlng = mlng;
	     if (mlat > ne.lat() || mlat < sw.lat()) {	newlat = sw.lat() + (ne.lat() - sw.lat())/2; }
	     if (mlng > ne.lng() || mlng < sw.lng()) {	newlng = sw.lng() + (ne.lng() - sw.lng())/2; }
	     if (newlat != mlat || newlng !=mlng) {
		report_point.setPosition(new google.maps.LatLng(newlat,newlng));
	     }
}



function selectControl(item) {
    clearMap();
    if (item == 0) {pointOverlay();}
    else if (item == 1) {satHeatOverlay();}

    for (i = 0; i < controllist.length; i++ ) {
      controllist[i].deselect();
    }
    controllist[item].select();
}

function clearMap(){
	nodata_info.close(map, nodata_marker);
	pointHeatmap.set('opacity',0)
	satHeatmap.set('opacity',0)
}

function pointOverlay(){
	pointHeatmap.set('opacity',0.75)
	report_point.set('visible',true);
}

function pointHeatOverlay(){
}


function satHeatOverlay(){
	satHeatmap.set('opacity',0.75)
}






function update_latlong(new_lat,new_lng){
  document.getElementById("latitude").value = new_lat;
  document.getElementById("longitude").value = new_lng;
  M.updateTextFields()
}


function show_form(){
  var x = document.getElementById("mapform");
  x.style.display = "block";

  update_latlong(report_point.getPosition().lat(),report_point.getPosition().lng());

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  } 
  if (mm < 10) {
    mm = '0' + mm;
  } 
  var today = mm + '/' + dd + '/' + yyyy;
  document.getElementById('submit_date').value = today;
  document.getElementById("reef_expert").value = 'None'
  M.updateTextFields()
}


function launch_record_script(lat, lng, submit_date, submit_expert, bleaching_level) {
   $.getJSON( '/_record_point',{
     lat: lat,
     lng: lng,
     submit_date: submit_date,
     submit_expert: submit_expert,
     bleaching_level: bleaching_level,
 }, function (data) {
    if (data.return_coral == "False") {
      alert('Your submitted data point is outside of the coral reef extent mapped by the Center for Global Discovery and Conservation Science.  Please check your point coordinates and try again.')
    }
    else{

        if (data.return_expert == "True"){
           alert('Your expert point has been submitted, and will be immediately added to the map!')
           launch_read_script();
        }
        else {
           alert('Your point has been submitted!  It will be reviewed by experts soon and added to the heatmap.');
        }
    }

 });
}

function launch_read_script() {
   $.getJSON( '/_read_all_points',{}, function (data) 
	{
		
	   	var return_data = Papa.parse(data.return_value).data;
		observed_bleaching_points = []
	   	markers = []
		for (var index = 0; index < return_data.length-1; index++)
		{
			var ll = new google.maps.LatLng(parseFloat(return_data[index][0]), parseFloat(return_data[index][1]))
			observed_bleaching_points.push({position: ll, dateinfo: return_data[index][2], recorder: return_data[index][3]})
		}
                for (var i = 0; i < observed_bleaching_points.length; i++) {
                    add_marker(observed_bleaching_points[i], map, infowindow)
                 };

		initialize_point_heatmap(observed_bleaching_points);


	});
}

function initialize_point_heatmap(obs) {
    // Create point marker Heatmap
    var pointHeatmapData = [];
    for (var i = 0; i < obs.length; i++) {
	if (obs[i].recorder == 'expert') {
        	pointHeatmapData.push(obs[i].position);
	}
    }
    pointHeatmap.setData(pointHeatmapData);
    pointHeatmap.setMap(map);
}

function initialize_sat_heatmap() {
    // Create point marker Heatmap
	//nodata_info.open(map, nodata_marker);
	//report_point.set('visible',false);

        $.getJSON( '/_read_satellite_data',{}, function (data) 
	{
		
	   	var return_data = Papa.parse(data.return_value).data;
		var sat_heatmap_data = []
		for (var index = 0; index < return_data.length-1; index++)
		{
			var ll = new google.maps.LatLng(parseFloat(return_data[index][1]), parseFloat(return_data[index][0]))
			sat_heatmap_data.push(ll)
		}

		add_sat_heatmap_points(sat_heatmap_data);
	});

}


function add_sat_heatmap_points(data) {
     		satHeatmap.setData(data);
     		satHeatmap.setMap(map);
}



function submit_form() {
    document.getElementById("post_submission_text").style.display="block";

    var submit_date = document.getElementById("submit_date").value
    var reef_expert = document.getElementById("reef_expert").value
    var submit_lat = document.getElementById("latitude").value
    var submit_lng = document.getElementById("longitude").value

    var bleaching_level;
    if ( document.getElementById('bleaching-level1').checked) {
	    bleaching_level = 1;
    }
    else if ( document.getElementById('bleaching-level3').checked) {
	    bleaching_level = 3;
    }
    else {
	    bleaching_level = 2;
    }

    launch_record_script(submit_lat, submit_lng, submit_date, reef_expert, bleaching_level);
}






/////////////////////////// AddPoint Settings //////////////////////////
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

function AddPointControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor ='#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.marginRight = '10px';
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
  controlText.style.width = '100px';
  controlText.style.paddingUp = '2px';
  controlText.style.paddingDown = '2px';
  controlText.innerHTML = 'Report Bleaching';
  controlUI.appendChild(controlText);
  this.controlText = controlText;

  // Setup the click event listener
  this.controlUI.addEventListener('click', function() {
    show_form();
  });
}





/////////////////////////// MyLocation Settings //////////////////////////


function MyLocationDiv(map) {
  this.div = document.createElement('div');
  this.div.index = 1;
  this.control = new MyLocationControl(this.div, map);
}
MyLocationDiv.prototype.activate = function() {
  this.control.controlText.style.color = caogreen;
}
MyLocationDiv.prototype.deactivate = function() {
  this.control.controlText.style.color = 'rgb(222,225,225)';
}
MyLocationDiv.prototype.set_text = function(text) {
  this.control.controlText.innerHTML = text;
}


function MyLocationControl(controlDiv, map) {
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
  //controlText.style.color = caogreen;
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '28px';
  //controlText.style.paddingLeft = '10px';
  //controlText.style.paddingRight = '10px';
  controlText.style.width = '80px';
  controlText.style.paddingUp = '2px';
  controlText.style.paddingDown = '2px';
  controlText.innerHTML = 'Find Me';
  controlUI.appendChild(controlText);
  this.controlText = controlText;

  // Setup the click event listener
  this.controlUI.addEventListener('click', function() {
    //show_form();
    
    //navigator.geolocation.getCurrentPosition(function(position) {
    //  var pos = {
    //    lat: position.coords.latitude,
    //    lng: position.coords.longitude
    //  };

    //  my_location_infowindow = new google.maps.InfoWindow();
    //  my_location_infoWindow.setPosition(pos);
    //  my_location_infoWindow.setContent('My Location.');
    //  my_location_infoWindow.open(map);
    //  map.setCenter(pos);
    //}, function() {
    //});


  });
}



/////////////////////////////////// Overlay Controls /////////////////////////////

function OverlayControl(controlDiv, map, id, dispTxt) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor ='#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.marginLeft = '2px';
  controlUI.style.marginRight = '2px';
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
  //controlText.style.paddingLeft = '2px';
  //controlText.style.paddingRight = '2px';
  controlText.style.width = '100px';
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


