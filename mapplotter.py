#!/usr/bin/python
# -*- coding: utf-8 -*-
from urllib.parse import urljoin
import requests

class MapPlotter:

    def __init__(self, url, host):
        self.query_url = urljoin(url, '/events?ids=')
        self.hosting_url = host;
        print("drawMarker Init()")

    def produceEventNameUrl(self,decodeds_json):
        result = "event_name="
        for index,decode in enumerate(decodeds_json):
            result += decode['type']
            if (index != (len(decodeds_json)-1)):
                result += ","
        return result

    def produceEventTimeUrl(self,decodeds_json):
        result = "event_time="
        for index,decode in enumerate(decodeds_json):
            if (decode["start_date"] == None):
                decode["start_date"] = "-"
            if (decode["start_time"] == None):
                decode["start_time"] = "-"
            if (decode["end_date"] == None):
                decode["end_date"] = "-"
            if (decode["end_time"] == None):
                decode["end_time"] = "-"

            result += decode["start_date"] + ":" + decode["start_time"] + "~" + decode["end_date"] + ":" + decode["end_time"]
            if (index != (len(decodeds_json)-1)):
                result += ","
        return result

    def produceEventLocationUrl(self, decodeds_json):
        result = "event_location="
        for decode in decodeds_json:
            for area in decode['affected_areas']:
                result += str(area['coordinates'][0]['wgs84_latitude']) + "," + str(area['coordinates'][0]['wgs84_longitude']) + ";"
        return result

    def produceEventRoadUrl(self, decodeds_json):
        result = "event_road="
        for index,decode in enumerate(decodeds_json):
            result += decode['road']
            if (index != (len(decodeds_json)-1)):
                result += ","

        # todo (polygon overlay by multiple coordinates): due to limitation this feature will be release in next version 
        '''
                for coordinate in area['coordinates']:
                    result += str(coordinate['wgs84_latitude'] + "," + str(coordinate['wgs84_longitude'])
        '''
        return result

    def produceEventParameters(self, json):
        return '&'.join([self.produceEventLocationUrl(json),
                         self.produceEventNameUrl(json),
                         self.produceEventTimeUrl(json),
                         self.produceEventRoadUrl(json)])

    #map.html?current_location=25.257738,121.473656&event_location=25.357738,121.573656;25.757738,121.673656;25.257738,121.173656&event_name=停水,停電,修路&event_time=2017-06-15:09:30:00~2017-06-16:16:00:00
    def drawMarkerById(self,eventIdLists,current_location):
        url_result = self.hosting_url + "map.html?"
        url_result += "current_location="+str(current_location['latitude'])+","+str(current_location['longitude'])
        if eventIdLists:
            url_eventId = ','.join(eventIdLists)
            query = self.query_url + str(url_eventId)
            print(query)
            r = requests.get(url=query)
            decoded = r.json()
            url_result += "&" + self.produceEventParameters(decoded)
        return url_result
