from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import time

@csrf_exempt
def calculate(request):
     # получает данные о зданиях и из них считает все нужное
     if request.method == 'POST':
         data = json.loads(request.body)
         print(data)
         
     time.sleep(2)
     return JsonResponse(data)