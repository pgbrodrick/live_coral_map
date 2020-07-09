


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
var satHeatmapCoarse;
//var bleaching_colors = ['#FFD700','#FF8C00','#FF0000'];
var bleaching_colors = ['rgb(255,255,0)','rgb(255,140,0)','rgb(255,0,0)'];

var caogreen = 'rgb(0,152,58)';

var legend;
var legendHeatmap;
var selectedControl;


function initialize_coral_map() {

    var startBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(18.5,-160.5),
    new google.maps.LatLng(22.0,-154.5));
    var mapMinZoom = 7;
    var mapMaxZoom = 18;

    map = new google.maps.Map(document.getElementById("map_canvas"),
	    		      {maxZoom: mapMaxZoom, 
			       minZoom:mapMinZoom, 
			       mapTypeId:'hybrid', 
			       mapTypeControl: false,
			       //mapTypeControlOptions: {position: google.maps.ControlPosition.LEFT_BOTTOM, 
			       //                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
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


    var satHeatControlDiv = new OverlayDiv(map, 0, "Satellite Update");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(satHeatControlDiv.div);

    var pointControlDiv = new OverlayDiv(map, 1, "Bleaching Observations");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(pointControlDiv.div);

    controllist = [ satHeatControlDiv, pointControlDiv ];

    //satHeatmap = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(200,100)], maxIntensity: 800, radius: 10});
    //satHeatmap = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(200,100)], maxIntensity: 1600, radius: 15});
    //satHeatmap = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(18.5,-160)], radius: 0.002, maxIntensity: 800, dissipating: false});
    satHeatmap = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(18.5,-160)], radius: 0.005, maxIntensity: 400, dissipating: false});
    satHeatmapCoarse = new google.maps.visualization.HeatmapLayer({data: [new google.maps.LatLng(18.5,-160)], maxIntensity: 2000, radius: 7});
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

    map.addListener('zoom_changed', function() {adjust_sat_overlay();});

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


    legend = document.getElementById('legend');
    var names = ['Light','Medium','Severe']
    for (var index =0; index < bleaching_colors.length; index++) {
      var name = names[2-index];//String(index + 1);
      var scale = 10;
      var opacity = 1;
      var div = document.createElement('div');
      div.innerHTML = "<img src='data:image/svg+xml;utf8,<svg viewBox=\"0 0 100 100\" height=\""+
      8*scale/8 + "\" width=\""+ 8*scale/8 + "\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"50\" cy=\"50\" r=\"50\" style=\"fill: " + bleaching_colors[2-index] + "; stroke: white; stroke-width: 1;\" opacity=\""+ opacity+ "\"/></svg>'> " + name;
      legend.appendChild(div);
    }


    legendHeatmap = document.getElementById('legendHeatmap');

    //map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    //map.addListener('tilesloaded',function(){selectControl(0)});
    selectControl(0);
}


function adjust_sat_overlay(){
	if (selectedControl == 0){
		satHeatOverlay();
	}
	//if (map.getZoom() == 12 || map.getZoom() == 11) {
	//}
}



function add_marker(point_info, map, infowindow, bleaching_level){

    var color;
    if (bleaching_level == '1'){color = bleaching_colors[0];}
    else if (bleaching_level == '3') {color = bleaching_colors[2];}
    else {color = bleaching_colors[1];}
    if (point_info.recorder == 'expert') {
    var marker = new google.maps.Marker({
         position: point_info.position,
         icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: color,
            fillOpacity: 1,
            fillColor: color
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
    selectedControl = item;
    if (item == 1) {
	    pointOverlay();
	    legendHeatmap.style.display="none";
	    legend.style.display="block";
    }
    else if (item == 0) {
	    satHeatOverlay();
	    legend.style.display="none";
	    legendHeatmap.style.display="block";
    }

    for (i = 0; i < controllist.length; i++ ) {
      controllist[i].deselect();
    }
    controllist[item].select();

}

function clearMap(){
	nodata_info.close(map, nodata_marker);
	pointHeatmap.set('opacity',0)
	satHeatmap.set('opacity',0)
	satHeatmapCoarse.set('opacity',0)
}

function pointOverlay(){
	//pointHeatmap.set('opacity',0.75)
	report_point.set('visible',true);
	for (var i = 0; i < markers.length; i++){
		markers[i].set('visible',true);
	}
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].clear()
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
}

function pointHeatOverlay(){
}


function satHeatOverlay(){
	if (map.getZoom() >= 10) {
		satHeatmap.set('opacity',1.);
		satHeatmapCoarse.set('opacity',0.);
	}
	else {
		satHeatmapCoarse.set('opacity',1.);
		satHeatmap.set('opacity',0.);
	}
	report_point.set('visible',false);
	for (var i = 0; i < markers.length; i++){
		markers[i].set('visible',false);
	}
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].clear()
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendHeatmap);

}






function update_latlong(new_lat,new_lng){
  document.getElementById("latitude").value = new_lat;
  document.getElementById("longitude").value = new_lng;
  M.updateTextFields()
}


function show_form(){
  var x = document.getElementById("mapform");
  
  if (x.style.display == 'none' || x.style.display == ""){
  x.style.display = "block";
  addpointDiv.control.controlText.style.color = caogreen;

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
  document.getElementById("reef_expert").value = 'None';
  M.updateTextFields();
  }
  else {
        x.style.display = "none";
        addpointDiv.control.controlText.style.color = 'rgb(0,0,0)';
  }
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
                    add_marker(observed_bleaching_points[i], map, infowindow, return_data[i][4])
                 };

		//initialize_point_heatmap(observed_bleaching_points);


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
			sat_heatmap_data.push({location: ll, weight: parseFloat(return_data[index][2])})
                        //add_marker({position: ll, recorder: 'expert', dateinfo: return_data[i][2]}, map, infowindow, Math.round(return_data[i][2]/4.*3.))
		}

		add_sat_heatmap_points(sat_heatmap_data);
	});

}


function add_sat_heatmap_points(data) {
     		satHeatmap.setData(data);
     		satHeatmap.setMap(map);
     		satHeatmapCoarse.setData(data);
     		satHeatmapCoarse.setMap(map);
    		selectControl(0);
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
  controlText.style.color = 'rgb(0,0,0)';
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
    show_form();
    
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      my_location_infowindow = new google.maps.InfoWindow();
      my_location_infoWindow.setPosition(pos);
      my_location_infoWindow.setContent('My Location.');
      my_location_infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
    });


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


