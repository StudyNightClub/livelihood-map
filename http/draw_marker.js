/* ------------------------------------------------------------------------------
*
*  # Livelihood maps
*
*  Specific livelihood event locations as marker on google map through "GET" parameter.
*
*  Version: 0.1
*  Latest update: Jun 11, 2017
*
*
* ---------------------------------------------------------------------------- */

$(function() {

	// Setup map
	var map = null;
	var infowindow = new google.maps.InfoWindow();

	function initialize() {

		var lat = getCurrentLocation('lat');
		var lng = getCurrentLocation('lng');

		if (lat == null && lng == null) {
			alert ('Current location error');
			return;
		}

		var myLatLng = new google.maps.LatLng(lat,lng);
		var label = "感興趣的位置";

   		map = new google.maps.Map(document.getElementById('map'), { 
   		    //mapTypeId: google.maps.MapTypeId.TERRAIN,
   		    zoom: 12,
   		    center: new google.maps.LatLng(lat,lng,3)
   		});

		//create current location as marker
		createMarker(myLatLng, label);
		drawEvents();

        //lonlat2Twd97(121,24);

        /*var urlField = 'http://egis.moea.gov.tw/MoeaEGFxData_WebAPI_Inside/InnoServe/BusinessBUSM?resptype=GeoJson&x='+lat+'&y='+lng+'&buffer=300';
        doCORSRequest({
            method: 'GET',
            url: urlField
        }, function printResult(result) {
            //outputField.value = result;
            console.log(result);
        });*/
    }

    // do CORS request due to origin header no allowance
    //refs: https://robwu.nl/cors-anywhere.html
    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    function doCORSRequest(options, printResult) {
        var x = new XMLHttpRequest();
        x.open(options.method, cors_api_url + options.url);
        x.onload = x.onerror = function() {
            console.log( options.method + ' ' + options.url + '\n' +
                x.status + ' ' + x.statusText + '\n\n' +
                (x.responseText || '')
            );
        };
        if (/^POST/i.test(options.method)) {
            x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        x.send(options.data);
    }

    function drawAroundInfo(response_result){
        alert(response_result);
        var obj = JSON.parse(response_result);
    }

    //Prepare code incase non coordinate data
    /*function codeAddress(address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
    }*/

	function drawEvents() {
		var event = [];
		event[0] = [];
		event[0][0] = [];

    	var eventLocation = GetGetParameter("event_location").split(";");
    	var eventName = GetGetParameter("event_name").split(",");
        var eventTime = GetGetParameter("event_time").split(",");
        var eventRoad = GetGetParameter("event_road").split(",");
    	for (var i = 0; i<eventLocation.length; i++) {
    		var evtLocTmp = eventLocation[i].split(",");
    		var evtLatLng = new google.maps.LatLng(evtLocTmp[0],evtLocTmp[1]);
    		var label = eventName[i] + "<br>" + eventTime[i] + "<br>" + eventRoad[i];
    		var evtMarker = createMarker(evtLatLng, label);
            drawRangeRadius(evtLatLng,500,evtMarker);
    	}

    	return null;
	}

    //radius = meter, e.g. 1000meter
    function drawRangeRadius(latlng, radius, bindMarker) {

        var circle = {
            strokeColor: "#c3fc49",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#c3fc49",
            fillOpacity: 0.35,
            map: map,
            center: latlng,
            radius: radius // in meters
        };

        cityCircle = new google.maps.Circle(circle);
        cityCircle.bindTo('center', bindMarker, 'position');
    }

	function getCurrentLocation(latlng_type) {
    	var latlng = GetGetParameter("current_location").split(",");
    	if (latlng_type == 'lat')
    		return latlng[0];
    	else if (latlng_type == 'lng')
    		return latlng[1];

    	return null;
	}

	//map.html?current_location=25.257738,121.473656&event_location=25.357738,121.573656;25.757738,121.673656;25.257738,121.173656&event_name=停水,停電,修路&event_time=2017-06-15:09:30:00~2017-06-16:16:00:00,2017-06-15:09:30:00~2017-06-16:16:00:00,2017-06-15:09:30:00~2017-06-16:16:00:00
	function GetGetParameter(parameterName) {
    	var result = null, tmp = [];
    	location.search.substr(1).split("&").forEach(function (item) {
        	tmp = item.split("=");
        	if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    	});

    	return result;
	}

	function createMarker(latlng, label) {
        var event_label = label.split("<br>");
        console.log(event_label[0]);
        if (event_label[0].localeCompare("water") == false)
        {
            color = 'blue';
            label = label.replace("water","停水公告")
        }
        else if (event_label[0].localeCompare("power") == false) {    
            color = 'yellow'; 
            label = label.replace("power","停電公告")
        }
        else if (event_label[0].localeCompare("road") == false) {
            color = 'purple';
            label = label.replace("road","修路公告")
        }
        else
            color = 'red';

        var contentString = '<b>'+label+'</b>';

    	var marker = new google.maps.Marker({
        	position: latlng,
        	map: map,
        	title: label,
            icon: 'http://maps.google.com/mapfiles/ms/icons/'+color+'-dot.png',
        	zIndex: Math.round(latlng.lat()*-100000)<<5
        });
        
        marker.myname = "Event" + label;

    	google.maps.event.addListener(marker, 'click', function() {
        	infowindow.setContent(contentString);
        	infowindow.open(map,marker);
        });

    	return marker;
	}

    //ref:http://www.kmvs.km.edu.tw/lf/index.php?op=ViewArticle&articleId=349&blogId=70
    /*
    function lonlat2Twd97(lon,lat)
    {
        var x97,y97;
        var a,b,long0,k0,dx;
        var e,e2,n,nu,p;
        var A,B,C,D,E,S;
        var K1,K2,K3;
        var K4,K5;
        a = 6378137.0;
        b = 6356752.314245;
        long0 = 121.0*Math.PI/180.0;
        k0 = 0.9999;
        dx = 250000;
        e = Math.pow(1-(b*b)/(a*a),0.5);
        e2 = Math.pow(e,2)/(1-Math.pow(e,2));
        n = (a-b)/(a+b);
        nu = a/Math.pow(1-Math.pow(e,2)*Math.pow(Math.sin(lat),2),0.5);
        p = lon-long0;
        A = a*(1 - n + (5/4.0)*(Math.pow(n,2) - Math.pow(n,3)) + (81/64.0)*(Math.pow(n,4)  - Math.pow(n,5)));
        B = (3*a*n/2.0)*(1 - n + (7/8.0)*(Math.pow(n,2) - Math.pow(n,3)) + (55/64.0)*(Math.pow(n,4) - Math.pow(n,5)));
        C = (15*a*Math.pow(n,2)/16.0)*(1 - n + (3/4.0)*(Math.pow(n,2) - Math.pow(n,3)));
        D = (35*a*Math.pow(n,3)/48.0)*(1 - n + (11/16.0)*(Math.pow(n,2) - Math.pow(n,3)));
        E = (315*a*Math.pow(n,4)/51.0)*(1 - n);
        S = A*lat - B*Math.sin(2*lat) + C*Math.sin(4*lat) - D*Math.sin(6*lat) + E*Math.sin(8*lat);
        K1 = S*k0;
        K2 = k0*nu*Math.sin(2*lat)/4.0;
        K3 = (k0*nu*Math.sin(lat)*Math.pow(Math.cos(lat),3)/24.0) * (5.0 - Math.pow(Math.tan(lat),2) + 9.0*e2*Math.pow(Math.cos(lat),2) + 4.0*Math.pow(e2,2)*Math.pow(Math.cos(lat),4));
        y97 = K1 + K2*Math.pow(p,2) + K3*Math.pow(p,4);

        K4 = k0*nu*Math.cos(lat);
        K5 = (k0*nu*Math.pow(Math.cos(lat),3)/6.0) * (1 - Math.pow(Math.tan(lat),2) + e2*Math.pow(Math.cos(lat),2));
        x97 = K4*p + K5*Math.pow(p,3) + dx;

        console.log('Lon '+lon + 'Lat' + lat+ ' => TWD97 = '+ x97 + ',' + y97);
    }
    */



	// Initialize map on window load
	google.maps.event.addDomListener(window, 'load', initialize);

});
