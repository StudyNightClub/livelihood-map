from MapPlotter import MapPlotter

#This is an example for generating a livelihood map url
userId_list = {'3d853b36-8d49-431a-a059-5ab59892cbe8','f7feb7fe-ce84-4473-8ccd-19ef99424799'};
# user current interest center point
current_location = {'latitude':'25.0308547','longitude':'121.5084855'}; #latitude, longitude
# api link and hosting link
x = MapPlotter('https://livelihood-api.herokuapp.com/events?ids=','http://www.3drens.tw/');
#url will be produced by this function
url = x.drawMarkerById(userId_list,current_location);
print (url)