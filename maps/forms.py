from django import forms
from mapbox_location_field.forms import LocationField

from .models import LocationModel


class LocationForm(forms.ModelForm):
    location = LocationField(map_attrs={
        "placeholder": "Выберите геопозицию на карте", "zoom": 7,
        "language": "ru",
        "center": [37.60024739728942, 55.763870740960954]
    })

    class Meta:
        model = LocationModel
        fields = "__all__"
