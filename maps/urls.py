from django.urls import path

from . import views
from . import api_views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/v1/TransportLocation', api_views.TransportLocationRetrieve.as_view(), name='TransportLocationAPIv1')
]
