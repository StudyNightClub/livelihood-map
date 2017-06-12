from mapplotter import MapPlotter

# This is an example for generating a livelihood map url
eventId_list = ['2b37b7a9-6e84-4524-9117-bde71a71c382','049c5182-4ab5-413a-82d7-67ca85e056c6','1d8ffd34-4506-41cb-aee9-ce7102b1ea9b'];
# user current interest center point
current_location = {'latitude':'25.0308547','longitude':'121.5084855'}; #latitude, longitude
# api link and hosting link
x = MapPlotter('https://livelihood-api.herokuapp.com/events?ids=','http://tingshengchu.myds.me:9999/');
# url will be produced by this function
url = x.drawMarkerById(eventId_list,current_location);
print(url)

# mark the current location only
url = x.drawMarkerById([], current_location)
print(url)
