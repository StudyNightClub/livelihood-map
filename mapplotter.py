# -*- coding: utf-8 -*-
from urllib.parse import urljoin, urlencode

class MapPlotter:

    def __init__(self, host):
        self.hosting_url = host;
        print("drawMarker Init()")

    #map.html?current_location=25.257738,121.473656&events=<event_id_1>,<event_id_2>
    def generateMapUrl(self, eventIdList, current_location):
        url_result = urljoin(self.hosting_url, 'map.html')
        query = {}
        query['current_location'] = ','.join([str(current_location['latitude']),
                                              str(current_location['longitude'])])
        if eventIdList:
            query['events'] = ','.join(eventIdList)

        query_tokens = [key + '=' + value for key, value in query.items()]
        query_str = '&'.join(query_tokens)
        url_result += '?' + query_str
        return url_result
