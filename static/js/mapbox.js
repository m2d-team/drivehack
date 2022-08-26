mapboxgl.accessToken = 'pk.eyJ1IjoidmVyeWJpZ3NhZCIsImEiOiJjbDc4MTUzcmEwNWV1NDFveDB2a3l3eGxzIn0.-En_lmcLWHl0K-udYl5gwQ';

let ROAD_DESCRIPTION = {}

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [37.56809243178864, 55.773323644594456], // starting position [lng, lat]
    zoom: 15, // starting zoom
    pitchWithRotate: false
});
map.dragRotate.disable()

const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
});
map.addControl(draw);

let before = {};
map.on('load', async () => {
    console.log('loaded')

    // метро/автобусы
    let data = await getTransportLocationData()
    let features = []
    for (let i = 0; i < data.length; i++) {
        addMarker(data[i].longitude, data[i].latitude, data[i])
    }
    map.addSource('places', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': features
        }
    })

    map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'places',
        'layout': {
            'icon-image': '{icon}',
            'icon-allow-overlap': true
        }
    });

    // дороги
    data = await getRoadData();
    for (let i = 0; i < data.length; i++) {
        let points = []
        for (let j = 0; j < data[i].drawing_points.length; j++) {
            points.push([data[i].drawing_points[j].longitude, data[i].drawing_points[j].latitude])
        }

        drawRoad(points, 'road_' + String(data[i].id), data[i])
        let percent = Math.round((data[i].base_traffic / data[i].traffic_limit));
        before[`${data[i].id}`] = {
            'base_traffic': data[i].base_traffic,
            'traffic_limit': data[i].traffic_limit,
            'direction': 0,
            'additional_traffic': 0
        }
        changeRoadColor('road_' + String(data[i].id), `rgb(${Math.round(255 * percent)}, ${255 - Math.round(255 * percent)},100)`)
    }
});

function changeRoadDescription(road_id, road_data) {
    ROAD_DESCRIPTION[road_id] = getDescriptionForRoad(road_data)

}

function changeRoadColor(road_id, new_color) {

    try {
        map.setPaintProperty(road_id, 'line-color', new_color)
    } catch (e) {
        console.log('tried to color and failed :(')
    }
}

let after = null

function changeColorsToResponse(resp) {
    Object.keys(resp).forEach((key) => {
        let red_color = 255 * (resp[key].base_traffic + resp[key].additional_traffic) / resp[key].traffic_limit;
        changeRoadColor('road_' + key, `rgb(${red_color}, ${255 - red_color}, 0)`)
        let road_data = resp[key]
        resp[key]['id'] = key
        changeRoadDescription('road_' + key, road_data)
        // resp[key]
    })
}

const addMarker = (long, lat, data) => {
    const el = document.createElement('div');
    el.className = 'marker';

    // let icon_size = get_icon_size();
    let icon_size = 30;

    // if (!post.attachment) return;
    let text1 = 'Станция <b>' + (data.transport_location_type === 'metro' ? 'Метро ' : '') + data.station_name +
        '</b> на пути <b>' + data.transport_line_id + '</b>'
    let text2 = `<p>Человек утром в час пик (тысяч в час): <b>${data.morning_thousands_avg_people_per_hour}</b></p>
                 <p>Человек вечером в час пик (тысяч в час): <b>${data.evening_thousands_avg_people_per_hour}</b></p>
                 <p>Максимальное возможное тысяч человек в час: <b>${data.max_thousands_people_per_hour}</b></p>`
    let img = ''
    if (data.transport_location_type === 'metro') {
        img = '/static/img/Moscow_Metro.svg'
    } else {
        img = '/static/img/mostrans.svg'
    }

    el.style.backgroundImage = `url(${img})`;
    icon_size += 'px';
    el.style.width = icon_size;
    el.style.height = icon_size;
    el.style.backgroundRepeat = 'no-repeat'
    el.style.backgroundSize = '100%';

    // el.addEventListener('click', () => {
    //     window.open('./', '_blank');
    // });

    const popup2 = new mapboxgl.Popup({offset: 25})
        .setHTML(`
                    <div class='popup_mapbox'>
                        <p>${text1}</p>
                        ${text2}
                    </div>
                `);

    map.addSource(`clown${data.longitude}`, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {
                'description': 'fuck'
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': [[long, lat], [long - 0.00001, lat - 0.00001]]
            }
        }
    })
    map.addLayer({
        'id': `clown${data.longitude}`,
        'type': 'line',
        'source': `clown${data.longitude}`,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-opacity': 1,
            'line-color': '#000000',
            'line-width': 100
        }
    })
    map.addSource(`clown2${data.longitude}`, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {
                'description': 'fuck'
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': [[long, lat], [long - 0.00001, lat - 0.00001]]
            }
        }
    })

    let percent = Math.max(data.morning_thousands_avg_people_per_hour, data.evening_thousands_avg_people_per_hour) / data.max_thousands_people_per_hour;
    let Red = 0
    let Green = 255 - Math.round(255 * (percent))
    let Blue = Math.round((255 * (percent)))
    map.addLayer({
        'id': `clown2${data.longitude}`,
        'type': 'line',
        'source': `clown2${data.longitude}`,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-opacity': 1,
            'line-color': `rgb(${Red}, ${Green}, ${Blue})`,
            'line-width': 100 * percent
        }
    })

    // Add markers to the map.
    // Делаем 2 маркера на long lat - один черный на фоне как максимум другой зелено-красный который показывает насколько пизда этому метро

    let marker = new mapboxgl.Marker(el)
        .setLngLat([long, lat])
        .setPopup(popup2)
        .addTo(map);
}

const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

function drawRoad(points, road_id, road_data) {
    ROAD_DESCRIPTION[road_id] = getDescriptionForRoad(road_data)
    map.addSource(road_id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': points
            }
        }
    })

    map.addLayer({
        'id': road_id,
        'type': 'line',
        'source': road_id,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-opacity': 0.7,
            'line-color': '#000000',
            'line-width': 6
        }
    });
    map.on('mouseenter', road_id, (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.lngLat;
        const description = ROAD_DESCRIPTION[road_id];

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on('mouseleave', road_id, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}

function getAllCoordinates() {
    // возвращает список списков пар координат (все полигоны)
    let features = draw.getAll().features
    let polygons = [];
    for (let i = 0; i < features.length; i++) {
        polygons.push(features[i].geometry.coordinates)
    }
    return polygons
}

function getCoords() {
    let constructions = draw.getAll().features;
    let data = [];

    constructions.forEach((el) => {
        let coords = el['geometry']['coordinates'][0];
        data.push(coords);
    })

    return data;
}


let area_counter = 0;
map.on('draw.create', addArea);
map.on('draw.delete', deleteArea);


for (let i = 0; i < 5; i++) {
    document.getElementById('build' + String(i + 1)).addEventListener('click', (e) => {
        if (e.target.disabled !== false) {
            return
        }

        // убираем остальные синие кнопки
        for (let j = 0; j < 5; j++) {
            document.getElementById('build' + String(j + 1)).classList.remove('bg-blue-500')
        }

        // ставим данные из нужной формы
        setFormData(params_data[Number(e.target.id.split('build')[1]) - 1])
        document.getElementById('current-build').value = Number(e.target.id.split('build')[1]) - 1
        e.target.classList.add('bg-blue-500')
    })
}


function addArea(ev) {
    console.log(popup)
    map.on('click', ev.features[0].id, (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = 'Здание номер ' + String(area_counter);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates).setHTML(description).addTo(map);
    })
    map.on('mouseleave', ev.features[0].id, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    // новый рисунок сделался, люблюино работем (добавляем на панельку)
    if (area_counter <= 4) {
        document.getElementById('build' + String(area_counter + 1)).disabled = undefined
    }
    area_counter += 1;
}

function deleteArea(e) {
    console.log(e)
    if (area_counter >= 1) {
        document.getElementById('build' + String(area_counter + 1)).disabled = true
    }
    area_counter -= 1
}

function debugHelper() {
    map.on('click', (e) => {
        alert(e.lngLat.wrap())
    });
}
