from django.shortcuts import render
from .forms import LocationForm


def index(request):
    return render(request, 'base.html', context={'form': LocationForm()})
