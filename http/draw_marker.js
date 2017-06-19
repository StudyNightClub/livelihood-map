/* ------------------------------------------------------------------------------
*
*  # Livelihood maps
*
*  Specific livelihood event locations as marker on google map through "GET" parameter.
*
*  Version: 1.1.2
*  Latest update: Jun 20, 2017
*
*
* ---------------------------------------------------------------------------- */

$(function() {

	// Setup map
	var map = null;
	var infowindow = new google.maps.InfoWindow();
    var x97,y97;
    var markerGroup = [];
    
    var evtMarkerGroup = [];
    var markerCluster;

	function initialize() {

		var lat = getCurrentLocation('lat');
		var lng = getCurrentLocation('lng');

		if (lat == null && lng == null) {
			alert ('Current location error');
			return;
		}

        $('.VisibileCheckbox').hide();

		var myLatLng = new google.maps.LatLng(lat,lng);
		var label = "你感興趣的位置";

   		map = new google.maps.Map(document.getElementById('map'), { 
            //mapTypeId: google.maps.MapTypeId.TERRAIN,
            zoom: 16,
            disableDefaultUI: true,
   		    center: new google.maps.LatLng(lat,lng,3)
   		});

		//create current location as marker
        //console.log('Original lng : '+ lat +' lat :' + lng);
		createMarker(myLatLng, label);
        requestEventInfo();

    }

    function requestEGIS(lon,lat){
        var jsonResult;

        var n_lon=lon*Math.PI/180.0;
        var n_lat=lat*Math.PI/180.0;

        var coor_twd_97 = lonlat2Twd97(n_lon,n_lat);

        var urlField = 'http://egis.moea.gov.tw/MoeaEGFxData_WebAPI_Inside/InnoServe/BusinessBUSM?resptype=GeoJson&x='+coor_twd_97.x97+'&y='+coor_twd_97.y97+'&buffer=300';
        doCORSRequest({
            method: 'GET',
            url: urlField
        }, function printResult(result) {
            jsonResult = JSON.parse(result);
            drawAroundInfo(jsonResult);
            $('.VisibileCheckbox').show();
            //console.log(result);
        });

        return jsonResult;
    }

    // do CORS request due to origin header no allowance
    //refs: https://robwu.nl/cors-anywhere.html
    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    function doCORSRequest(options, printResult) {
        var x = new XMLHttpRequest();
        x.open(options.method, cors_api_url + options.url);
        x.onload = x.onerror = function() {
            printResult(x.responseText);
        };
        if (/^POST/i.test(options.method)) {
            x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        x.send(options.data);
    }

    function drawAroundInfo(response_result){
        var count = Object.keys(response_result.features).length;
        var mod = 1;
        console.log("json length" +count);

        if (count > 30) {mod = 3;}
        else if (count > 10 && count <= 30) {mod = 2};

        for (var i =0; i<count ; i++) {
            //console.log(response_result.features[i].geometry.coordinates[0]);
            //console.log(response_result.features[i].geometry.coordinates[1]);
            //console.log(response_result.features[i].properties.Addr);
            //console.log(response_result.features[i].properties.BussName);
            if (i % mod == 0){
                var coor_wgs_87 = twd97_to_latlng(response_result.features[i].geometry.coordinates[0],response_result.features[i].geometry.coordinates[1]);
                var bussLatLng = new google.maps.LatLng(coor_wgs_87.lat,coor_wgs_87.lng);
                markerGroup.push(createMarker(bussLatLng,"商家<br>" + response_result.features[i].properties.BussName + "<br>"+ response_result.features[i].properties.Addr));
            }
        }
    }

    function drawEventsByJson(response_result){
        var count = Object.keys(response_result).length;
        var mod = 1;
        //console.log("json length" +count);

        for (var i =0; i<count ; i++) {
            var eventLatLng = new google.maps.LatLng(response_result[i].affected_areas[0].coordinates[0].wgs84_latitude,response_result[i].affected_areas[0].coordinates[0].wgs84_longitude);
            var start_date = response_result[i].start_date;
            var end_date = response_result[i].end_date;
            var start_time = response_result[i].start_time;
            var end_time = response_result[i].end_time;
            var time = concatTime(start_time,end_time);
            var eventType = response_result[i].type;
            var city = response_result[i].city;
            var district = response_result[i].district;
            var road = response_result[i].road;

            requestEGIS(response_result[i].affected_areas[0].coordinates[0].wgs84_longitude,response_result[i].affected_areas[0].coordinates[0].wgs84_latitude);
            var evtMarker = createMarker(eventLatLng, eventType + "<br>" + start_date + " ~ " + end_date + "<br>" + time  + "<br>" + city + district + road);
            evtMarkerGroup.push(evtMarker);
            drawRangeRadius(eventLatLng,350,evtMarker);
        }
    }

    function concatTime(startTime, endTime){
        if (startTime == null && endTime ==null)
            return "依交通管制時間施工";
        else if (startTime == null)
            return "依交通管制時間施工 ~ "+ endTime.substr(0,endTime.length - 3);
        else if (endTime == null)
            return startTime.substr(0,startTime.length - 3) + " ~ 依交通管制時間施工";
        else
            return startTime.substr(0,startTime.length - 3) + " ~ "+ endTime.substr(0,endTime.length - 3);

    }

    function setMarkerGroupVisible(visible) {
        for (var i =0; i<markerGroup.length; i++)
            markerGroup[i].setVisible(visible);

        for (var i =0; i<evtMarkerGroup.length; i++)
            evtMarkerGroup[i].setVisible(!visible);
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

    function requestEventInfo(){
        var urlField = 'https://livelihood-api.herokuapp.com/events?ids='+GetGetParameter("events");
        doCORSRequest({
            method: 'GET',
            url: urlField
        }, function printResult(result) {
            console.log(result);
            jsonResult = JSON.parse(result);
            drawEventsByJson(jsonResult);
        });
    }

    //radius = meter, e.g. 1000meter
    function drawRangeRadius(latlng, radius, bindMarker) {

        var circle = {
            strokeColor: "#8E8E8E",
            strokeOpacity: 0.6,
            strokeWeight: 1.2,
            fillColor: "#8E8E8E",
            fillOpacity: 0.3,
            map: map,
            center: latlng,
            radius: radius // in meters
        };

        cityCircle = new google.maps.Circle(circle);
        //cityCircle.bindTo('center', bindMarker, 'position');
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
        var marker_visible = true;
        //console.log(event_label[0]);
        if (event_label[0].localeCompare("water") == false)
        {
            color = 'blue-dot';
            label = label.replace("water","停水通知")
        }
        else if (event_label[0].localeCompare("power") == false) {    
            color = 'green-dot';
            label = label.replace("power","停電通知")
        }
        else if (event_label[0].localeCompare("road") == false) {
            color = 'orange-dot';
            label = label.replace("road","道路施工通知")
        }
        else if (event_label[0].localeCompare("商家") == false) {
            label = label.replace("商家","本地商家")
            color = 'rangerstation';
            marker_visible = false;
        }
        else
            color = 'red-dot';

        var contentString = '<b>'+label+'</b>';

    	var marker = new google.maps.Marker({
        	position: latlng,
        	map: map,
        	title: label,
            visible: marker_visible,
            icon: 'http://maps.google.com/mapfiles/ms/icons/'+color+'.png',
        	zIndex: Math.round(latlng.lat()*-100000)<<5
        });
        
        marker.myname = "Event" + label;

    	google.maps.event.addListener(marker, 'click', function() {
        	infowindow.setContent(contentString);
        	infowindow.open(map,marker);
        });

    	return marker;
	}

    //wgs87 <-> twd97 converter can be verified by this website online tool
    //ref:http://www.kmvs.km.edu.tw/lf/index.php?op=ViewArticle&articleId=349&blogId=70
    function lonlat2Twd97(lon,lat)
    {
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
        $y97 = K1 + K2*Math.pow(p,2) + K3*Math.pow(p,4);
        K4 = k0*nu*Math.cos(lat);
        K5 = (k0*nu*Math.pow(Math.cos(lat),3)/6.0) * (1 - Math.pow(Math.tan(lat),2) + e2*Math.pow(Math.cos(lat),2));
        $x97 = K4*p + K5*Math.pow(p,3) + dx;

        //console.log('Lon '+lon + 'Lat' + lat+ ' => TWD97 = '+ $x97 + ',' + $y97);
        return {
            x97: $x97,
            y97: $y97
        };
    }


    //refs: https://kuro.tw/posts/2015/06/11/js-note-twd97-convert-to-longitude-and-latitude/
    function twd97_to_latlng($x, $y) {
      var pow = Math.pow, M_PI = Math.PI;
      var sin = Math.sin, cos = Math.cos, tan = Math.tan;
      var $a = 6378137.0, $b = 6356752.314245;
      var $lng0 = 121 * M_PI / 180, $k0 = 0.9999, $dx = 250000, $dy = 0;
      var $e = pow((1 - pow($b, 2) / pow($a, 2)), 0.5);
      $x -= $dx;
      $y -= $dy;
      var $M = $y / $k0;
      var $mu = $M / ($a * (1.0 - pow($e, 2) / 4.0 - 3 * pow($e, 4) / 64.0 - 5 * pow($e, 6) / 256.0));
      var $e1 = (1.0 - pow((1.0 - pow($e, 2)), 0.5)) / (1.0 + pow((1.0 - pow($e, 2)), 0.5));
      var $J1 = (3 * $e1 / 2 - 27 * pow($e1, 3) / 32.0);
      var $J2 = (21 * pow($e1, 2) / 16 - 55 * pow($e1, 4) / 32.0);
      var $J3 = (151 * pow($e1, 3) / 96.0);
      var $J4 = (1097 * pow($e1, 4) / 512.0);
      var $fp = $mu + $J1 * sin(2 * $mu) + $J2 * sin(4 * $mu) + $J3 * sin(6 * $mu) + $J4 * sin(8 * $mu);
      var $e2 = pow(($e * $a / $b), 2);
      var $C1 = pow($e2 * cos($fp), 2);
      var $T1 = pow(tan($fp), 2);
      var $R1 = $a * (1 - pow($e, 2)) / pow((1 - pow($e, 2) * pow(sin($fp), 2)), (3.0 / 2.0));
      var $N1 = $a / pow((1 - pow($e, 2) * pow(sin($fp), 2)), 0.5);
      var $D = $x / ($N1 * $k0);
      var $Q1 = $N1 * tan($fp) / $R1;
      var $Q2 = (pow($D, 2) / 2.0);
      var $Q3 = (5 + 3 * $T1 + 10 * $C1 - 4 * pow($C1, 2) - 9 * $e2) * pow($D, 4) / 24.0;
      var $Q4 = (61 + 90 * $T1 + 298 * $C1 + 45 * pow($T1, 2) - 3 * pow($C1, 2) - 252 * $e2) * pow($D, 6) / 720.0;
      var $lat = $fp - $Q1 * ($Q2 - $Q3 + $Q4);
      var $Q5 = $D;
      var $Q6 = (1 + 2 * $T1 + $C1) * pow($D, 3) / 6;
      var $Q7 = (5 - 2 * $C1 + 28 * $T1 - 3 * pow($C1, 2) + 8 * $e2 + 24 * pow($T1, 2)) * pow($D, 5) / 120.0;
      var $lng = $lng0 + ($Q5 - $Q6 + $Q7) / cos($fp);
      $lat = ($lat * 180) / M_PI;
      $lng = ($lng * 180) / M_PI;
      return {
        lat: $lat,
        lng: $lng
      };
    }
    
    function setMarkerClusterVisible(visible) {
        for (var i =0; i<evtMarkerCluster.length; i++)
                evtMarkerCluster[i].setVisible(visible);
    }
    
    function displayMarkerCluster() {
        // Display marker cluster of stores              
        markerCluster = new MarkerClusterer(map, markerGroup, {imagePath: './marker_clusterer/images/m'});
        
        markerCluster.setMinClusterSize(5);
    }
    
    function hideMarkerCluster() {
        markerCluster.clearMarkers();
    }
    
	// Initialize map on window load
    initialize();
	// google.maps.event.addDomListener(window, 'load', initialize);

    //set checkbox for marker group visible / invisible
    $('.VisibileCheckbox').change(function() {
        if (this.checked) {
             setMarkerGroupVisible(true);
             displayMarkerCluster();
             
        } else {
            setMarkerGroupVisible(false);
            hideMarkerCluster();
        }
    });

});
