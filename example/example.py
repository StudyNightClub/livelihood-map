from mapplotter import MapPlotter

#This is an example for generating a livelihood map url
eventId_list = ['2b37b7a9-6e84-4524-9117-bde71a71c382','5a627f87-9f30-46f3-945f-9dd134513c39'];
# user current interest center point
current_location = {'latitude':'25.0308547','longitude':'121.5084855'}; #latitude, longitude
# api link and hosting link
x = MapPlotter('https://livelihood-api.herokuapp.com/events?ids=','http://www.3drens.tw/');
#url will be produced by this function
url = x.drawMarkerById(eventId_list,current_location);
print (url)
