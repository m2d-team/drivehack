import json
import time
import numpy

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


'''
coords for test:
[37.56885102020473, 55.77097100672404]
[37.56910848121305, 55.77069342942761]
[37.56777826600262, 55.77028309415172]
[37.56752080499436, 55.77056067436962]
[37.56885102020473, 55.77097100672404]
'''


@csrf_exempt
def calculate(request):
    # получает данные о зданиях и из них считает все нужное
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
         
    time.sleep(2)
    return JsonResponse(data)


def find_centroid(coords):
    pass