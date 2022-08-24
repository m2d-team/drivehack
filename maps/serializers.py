from rest_framework import serializers

from maps.models import TransportLocation


class TransportLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportLocation
        exclude = ('id',)


