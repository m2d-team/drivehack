from functools import total_ordering
import graphlib
import json
import time
import numpy
import math
from bfs import bfs_total

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from calculating.algorithm import find_centroid, get_nearest_point_id, get_road_by_point_id, get_road_point, get_distance

from maps.models import Road, DrawingPoint

@csrf_exempt
def calculate(request):
    # получает данные о зданиях и из них считает все нужное
    if request.method == 'POST':
        data = json.loads(request.body)
        response = send_dummies()
        # print(data['coordinates'])
        # print(data['0'])
        start_point_id = calculate_additional_traffic(data)
        build_graph(start_point_id)


        # print(start_point_id)
        
    return JsonResponse(response)


def calculate_additional_traffic(data):
    additional_people = calculate_people_growth(data['0'])
    metro, buses, cars = calculate_transport_split(additional_people)
    cars_growth = calculate_cars_growth(buses, cars)

    centroid = find_centroid(data['coordinates'][0])
    start_point_id = get_nearest_point_id(centroid)

    return start_point_id


def calculate_people_growth(data):
    if data['build-type'] == 'Жилое помещение':
        return (int(data['build-area']) // 25) * 0.6
    if data['build-type'] == 'Офис':
        return int(data['build-area']) // 10


def calculate_transport_split(amount):
    # метро/общ.транспорт/авто
    return math.ceil(amount * 0.3), math.ceil(amount * 0.3), math.ceil(amount * 0.4)


def calculate_cars_growth(bus_enjoyers, car_fans):
    return math.ceil(bus_enjoyers / 84) + math.ceil(car_fans / 1.2)


def send_dummies():
    data = {}
    roads_data = Road.objects.all()

    for road in roads_data:
        data[road.id] = {
            'additional_traffic': 100,
            'base_traffic': road.base_traffic,
            'traffic_limit': road.traffic_limit,
            'direction': 0 # если 0 - от первой к последней, иначе от последней к первой вершине
        }
    return data


def build_graph(start_id):
    graph = dict()
    base_roads = DrawingPoint.objects.get(id=start_id).road.all()
    graph[0] = [el.id for el in base_roads]
    
    queue = graph[0].copy()
    visited = set()


    while queue:
        road_id = queue.pop(0)
        nodes = DrawingPoint.objects.filter(road__id=road_id)
        connections = []

        for node in nodes:
            # print(nod/ited)
            roads_connected = DrawingPoint.objects.get(id=node.id).road.exclude(id=road_id)

            for road in roads_connected:
                if road.id not in visited:
                    queue.append(road.id)

                connections.append(road.id)

        graph[road_id] = connections.copy() 
        visited.add(road_id)
        # print(graph)

    return graph
