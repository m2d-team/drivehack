from django.db import models


class LocationMixin(models.Model):
    longitude = models.DecimalField(decimal_places=6, max_digits=10)
    latitude = models.DecimalField(decimal_places=6, max_digits=10)

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
    TRANSPORT_TYPES_DICT = {val: name for val, name in TRANSPORT_TYPES}

    transport_location_type = models.CharField('Тип транспорта', max_length=40, choices=TRANSPORT_TYPES)
    transport_line_id = models.CharField('Номер линии метро/автобуса/т.д.', max_length=40)
    station_name = models.CharField('Название остановки', max_length=100)

    morning_thousands_avg_people_per_hour = models.FloatField('Тысяч человек в час утром в час пик')
    evening_thousands_avg_people_per_hour = models.FloatField('Тысяч человек в час вечером в час пик')
    max_thousands_people_per_hour = models.FloatField('Тысяч человек в час максимум')

    def __str__(self):
        return f'{self.station_name}'

    class Meta:
        verbose_name = 'Место транспортной остановки'
        verbose_name_plural = 'Места транспортных остановок'


class Road(models.Model):
    # дорога
    auto_per_hour = models.IntegerField(default=0)
    load_percent = models.IntegerField(default=0)


class MeaningPoint(LocationMixin):
    # граф для развилок в дорогах
    roads_connected = models.ManyToManyField(Road)


class DrawingPoint(LocationMixin):
    # одна из точек для отрисовки дорог
    road = models.ForeignKey(Road, on_delete=models.CASCADE)

