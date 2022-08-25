from django.contrib import admin

from .models import TransportLocation, Road, DrawingPoint, MeaningPoint


class TransportLocationAdmin(admin.ModelAdmin):
    model = TransportLocation
    fieldsets = ((None, {
        'fields': ('station_name', 'transport_line_id', 'transport_location_type',
                   'morning_thousands_avg_people_per_hour', 'evening_thousands_avg_people_per_hour',
                   'max_thousands_people_per_hour')
    }),)
    list_display = ('station_name', 'transport_line_id', 'transport_location_type',
                    'morning_thousands_avg_people_per_hour', 'evening_thousands_avg_people_per_hour',
                    'max_thousands_people_per_hour')
    list_filter = ('transport_location_type',)
    ordering = ('transport_line_id', 'transport_line_id', 'morning_thousands_avg_people_per_hour',
                'evening_thousands_avg_people_per_hour', 'max_thousands_people_per_hour')


admin.site.register(TransportLocation, TransportLocationAdmin)

admin.site.register(Road)
admin.site.register(MeaningPoint)
admin.site.register(DrawingPoint)

