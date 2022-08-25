from django.urls import path

from . import views

urlpatterns = [
    path('api/v1/calculate', views.calculate, name='calculate'),
]
