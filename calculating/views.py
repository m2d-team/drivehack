import json
import time
import numpy
import math

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from calculating.algorithm import find_centroid, get_nearest_point_id, get_road_by_point_id, get_road_point, get_distance


@csrf_exempt
def calculate(request):
    # получает данные о зданиях и из них считает все нужное
    if request.method == 'POST':
        data = json.loads(request.body)
        # print(data['coordinates'])
        # print(data['0'])
        road_obj, start_point = calculate_additional_traffic(data)



        print(road_obj, start_point)
        
    return JsonResponse(data)


def calculate_additional_traffic(data):
    additional_people = calculate_people_growth(data['0'])
    metro, buses, cars = calculate_transport_split(additional_people)
    cars_growth = calculate_cars_growth(buses, cars)

    centroid = find_centroid(data['coordinates'][0])
    start_point_id = get_nearest_point_id(centroid)

    road_obj = get_road_by_point_id(start_point_id)    
    start_point = get_road_point(road_obj, centroid)

    

    return road_obj, start_point


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
