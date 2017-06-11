from MapPlotter import MapPlotter

#This is an example for generating a livelihood map url
userId_list = {'c8eeb9a44dfe11e7ab03','c8f4b2324dfe11e7ab03','cd4e5d924dfe11e7ab03','c8fcc5e44dfe11e7ab03'};
current_location = {'latitude':'25.0339','longitude':'121.5645'}; #latitude, longitude
x = MapPlotter('https://livelihood-api.herokuapp.com/events?ids=','http://www.3drens.tw/');
x.drawMarkerById(userId_list,current_location);