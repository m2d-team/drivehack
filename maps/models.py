from django.db import models
from mapbox_location_field.models import LocationField
# from mapbox_location_field.spatial.models import SpatialLocationField


class LocationModel(models.Model):
    location = LocationField()
    # spatial_location = SpatialLocationField()
