from django.urls import path

from . import views
from . import api_views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/v1/TransportLocation', api_views.TransportLocationRetrieveView.as_view(), name='TransportLocationAPIv1'),
    path('api/v1/Road', api_views.RoadView.as_view(), name='RoadAPIv1')
]
