# Generated by Django 4.1 on 2022-08-25 12:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0002_road_meaningpoint_drawingpoint'),
    ]

    operations = [
        migrations.AlterField(
            model_name='drawingpoint',
            name='latitude',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='drawingpoint',
            name='longitude',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='meaningpoint',
            name='latitude',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='meaningpoint',
            name='longitude',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='transportlocation',
            name='latitude',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
        migrations.AlterField(
            model_name='transportlocation',
            name='longitude',
            field=models.DecimalField(decimal_places=15, max_digits=20),
        ),
    ]
