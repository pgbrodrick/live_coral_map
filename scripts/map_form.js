


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

    map.fitBounds(startBounds);

    downloadDiv = new AddPointDiv(map);
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(downloadDiv.div);

    launch_read_script();

    infowindow = new google.maps.InfoWindow();

    // Event that closes the Info Window with a click on the map
    google.maps.event.addListener(map, 'click', function() {
       infoWindow.close();
    });



    // Create output marker
    added_point = new google.maps.Marker({
     draggable:true,
     position: new google.maps.LatLng(19.0,-156),
     map: map
    });

    added_point.setMap(map);
  	document.getElementById("submission_button").addEventListener("click",function(){submit_form()});



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
}


function launch_record_script(lat, lng, submit_date, submit_expert) {
   $.getJSON( '/_record_point',{
     lat: lat,
     lng: lng,
     submit_date: submit_date,
     submit_expert: submit_expert,
 }, function (data) {
    if (data.error_string == 'out_of_bounds'){
      alert('Unfortunately, your data point is outside of the bounds of live coral events.  Please re-check the location')
    }
    else {
      alert('Your point has been added at (' + data.error_string + ')!  Please be patient, it will display on the map shortly.');
    }
    launch_read_script();

 });
}

function launch_read_script() {
   $.getJSON( '/_read_all_points',{}, function (data) 
	{
		
		var return_data = CSVToArray(data.return_value);
		observed_bleaching_points = []
	   	markers = []
		for (var index = 1; index < return_data.length; index++)
		{
			var ll = new google.maps.LatLng(parseFloat(return_data[index][0]), parseFloat(return_data[index][1]))
			observed_bleaching_points.push({position: ll, dateinfo: return_data[index][2], recorder: return_data[index][3]})
		}

                for (var i = 0; i < observed_bleaching_points.length; i++) {
                    add_marker(observed_bleaching_points[i].position, 'Date Recorded: ' + observed_bleaching_points[i].dateinfo, map, infowindow)
                 };


	});
}






function submit_form() {
    document.getElementById("post_submission_text").style.display="block";
    //document.getElementById("latitude").value = added_point.getPosition().lat();
    //document.getElementById("longitude").value = added_point.getPosition().lng();

    var submit_date = document.getElementById("submit_date").value
    var reef_expert = document.getElementById("reef_expert").value
    var submit_lat = document.getElementById("latitude").value
    var submit_lng = document.getElementById("longitude").value

    launch_record_script(submit_lat, submit_lng, submit_date, reef_expert)
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



function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
                (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ), "gi");

        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData ))
        {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter))
                {
                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );

                }

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){
                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                                new RegExp( "\"\"", "g" ),
                                "\""
                                );

                } else 
                {
                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];
                }

                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
}
