from functools import total_ordering
import graphlib
import json
import time
import numpy
import math
from calculating.bfs import bfs_total

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from calculating.algorithm import find_centroid, get_nearest_point_id, get_road_by_point_id, get_road_point, get_distance

from maps.models import Road, DrawingPoint, TransportLocation


ROADS_AMOUNT = 6


@csrf_exempt
def calculate(request):
    # получает данные о зданиях и из них считает все нужное
    if request.method == 'POST':
        data = json.loads(request.body)
        amount = len(data['coordinates'])
        final_traffic = [0 for _ in range(ROADS_AMOUNT)]
    
        # response = send_dummies()
        # print(data)
        # print(data['0'])
        for i in range(amount):    
            if not data[str(i)]['is-on']:
                continue

            # print(data[str(i)])
            start_point_id, metro_growth, cars_growth = calculate_additional_traffic(data[str(i)], data['coordinates'][i])
            graph = build_graph(start_point_id)
            roads_info = get_roads_info()

            # print(start_point_id)
            # print(metro_growth, cars_growth)
            # print(graph)
            # print(roads_info)

            new_cars = bfs_total(graph, cars_growth, roads_info)[1:]
            for i in range(len(new_cars[1:])):
                final_traffic[i] += new_cars[i]

        response = make_response(final_traffic, roads_info, metro_growth)

        # print(result[1:])
        # print(response)
        # print(start_point_id)

    return JsonResponse(response)


def calculate_additional_traffic(data, coords):
    additional_people = calculate_people_growth(data)
    public, cars = calculate_transport_split(additional_people)

    print(public + cars)
    metro = TransportLocation.objects.get(id=1)

    centroid = find_centroid(coords)

    dist = get_distance( (metro.longitude, metro.latitude), centroid )
    metro, buses = metro_people(dist, public)
    cars_growth = calculate_cars_growth(buses, cars)
    
    start_point_id = get_nearest_point_id(centroid)
    road_obj = get_road_by_point_id(start_point_id)
    point_id = get_road_point(road_obj, centroid)

    return point_id, metro, cars_growth


def calculate_people_growth(data):
    if data['build-type'] == 'Жилое помещение':
        return (math.ceil(int(data['build-area'])) / 25 * 0.6)
    if data['build-type'] == 'Офис':
        return math.ceil(int(data['build-area']) / 10)


def calculate_transport_split(amount):
    # общ.транспорт/авто
    return math.ceil(amount * 0.6), math.ceil(amount * 0.4)


def calculate_cars_growth(bus_enjoyers, car_fans):
    return math.ceil(bus_enjoyers / 84) + math.ceil(car_fans / 1.2)


def get_roads_info():
    data = {
        'ids': [],
        'base_traffic': [],
        'traffic_limit': [],
        'first_points': [],
        'last_points': [],
    }
    roads_data = Road.objects.all()

    for road in roads_data:
        data['ids'].append(road.id)
        data['base_traffic'].append(road.base_traffic)
        data['traffic_limit'].append(road.traffic_limit)
        data['first_points'].append(road.get_first_point().id)
        data['last_points'].append(road.get_last_point().id)
    return data
 


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


def make_response(additional_traffic, road_data, metro_growth):
    response = {
        'metro_growth': metro_growth,
        'roads': {}
    }

    for i in range(len(additional_traffic)):
        # print(road_data['ids'][i])
        response['roads'][ road_data['ids'][i] ] = {
            'additional_traffic': additional_traffic[i],
            'base_traffic': road_data['base_traffic'][i],
            'traffic_limit': road_data['traffic_limit'][i],
            'direction': 0,
        }
    return response


def metro_people(distance, people):
    if (distance <= 300):
        return math.ceil(people * 0.5), math.ceil(people * 0.5) 
    elif (300 <= distance and distance <= 1500):
        return math.ceil( people * 0.25), math.ceil(people * 0.75)
    else:
        return math.ceil(people * 0.1), math.ceil(people * 0.9)


def build_graph(start_id):
    graph = dict()
    # directions = [-1 for _ in range(len(first_points))]
    base_roads = DrawingPoint.objects.get(id=start_id).road.all()
    # print(start_id, base_roads)
    graph[0] = [(el.id - 8) for el in base_roads]
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
                    # print(node.id, first_points[road.id - 8], last_points[road.id - 8])
                    queue.append(road.id)

                connections.append(road.id - 8)

        graph[road_id] = connections.copy() 
        visited.add(road_id)

    return graph
