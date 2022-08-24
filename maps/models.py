from django.db import models


class LocationMixin(models.Model):
    longitude = models.DecimalField()
    latitude = models.DecimalField()

    class Meta:
        abstract = True


class TransportLocation(LocationMixin):
    TRANSPORT_TYPES = [
        ('metro', 'Метро'),
        ('bus', 'Автобус'),
        ('tram', 'Трамвай'),
        ('trolleybus', 'Троллейбус'),
        ('mcd', 'МЦД'),
    ]

    transport_location_type = models.CharField('Тип транспорта', max_length=40, choices=TRANSPORT_TYPES)
    transport_line_id = models.CharField('Номер линии метро/автобуса/т.д.', max_length=40)
    station_name = models.CharField('Название остановки', max_length=100)

    morning_thousands_avg_people_per_hour = models.FloatField('Тысяч человек в час утром в час пик')
    evening_thousands_avg_people_per_hour = models.FloatField('Тысяч человек в час вечером в час пик')
    max_thousands_people_per_hour = models.FloatField('Тысяч человек в час максимум')

    class Meta:
        verbose_name = 'Место транспортной остановки'
