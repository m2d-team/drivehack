from rest_framework.generics import ListAPIView

from maps.models import TransportLocation
from maps.serializers import TransportLocationSerializer


class TransportLocationRetrieve(ListAPIView):
    queryset = TransportLocation.objects.all()
    serializer_class = TransportLocationSerializer
