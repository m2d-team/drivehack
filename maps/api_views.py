from rest_framework.generics import ListAPIView

from maps.models import TransportLocation, Road
from maps.serializers import TransportLocationSerializer, RoadSerializer


class TransportLocationRetrieveView(ListAPIView):
    queryset = TransportLocation.objects.all()
    serializer_class = TransportLocationSerializer


class RoadView(ListAPIView):
    queryset = Road.objects.all().prefetch_related('drawingpoint_set')
    serializer_class = RoadSerializer

