# Generated by Django 4.1 on 2022-08-25 22:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0007_remove_road_east_to_west_auto_per_hour_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='road',
            name='base_traffic',
            field=models.IntegerField(default=50),
        ),
    ]