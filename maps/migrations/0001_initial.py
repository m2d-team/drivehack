# Generated by Django 4.1 on 2022-08-25 07:13

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TransportLocation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=10)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=10)),
                ('transport_location_type', models.CharField(choices=[('metro', 'Метро'), ('bus', 'Автобус'), ('tram', 'Трамвай'), ('trolleybus', 'Троллейбус'), ('mcd', 'МЦД')], max_length=40, verbose_name='Тип транспорта')),
                ('transport_line_id', models.CharField(max_length=40, verbose_name='Номер линии метро/автобуса/т.д.')),
                ('station_name', models.CharField(max_length=100, verbose_name='Название остановки')),
                ('morning_thousands_avg_people_per_hour', models.FloatField(verbose_name='Тысяч человек в час утром в час пик')),
                ('evening_thousands_avg_people_per_hour', models.FloatField(verbose_name='Тысяч человек в час вечером в час пик')),
                ('max_thousands_people_per_hour', models.FloatField(verbose_name='Тысяч человек в час максимум')),
            ],
            options={
                'verbose_name': 'Место транспортной остановки',
                'verbose_name_plural': 'Места транспортных остановок',
            },
        ),
    ]
