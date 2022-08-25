from rest_framework import serializers

from maps.models import TransportLocation, Road, DrawingPoint


class TransportLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportLocation
        exclude = ('id',)


# class MeaningPointSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = MeaningPoint
#         fields = ('longitude', 'latitude', 'id')


class DrawingPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawingPoint
        fields = ('longitude', 'latitude')


class RoadSerializer(serializers.ModelSerializer):
    # meaning_points = MeaningPointSerializer(source='meaningpoint_set', many=True)
    drawing_points = DrawingPointSerializer(source='drawingpoint_set', many=True)

    class Meta:
        model = Road
        fields = ('id', 'drawing_points', 'base_traffic', 'traffic_limit')
