mapboxgl.accessToken = 'pk.eyJ1IjoidmVyeWJpZ3NhZCIsImEiOiJjbDc4MTUzcmEwNWV1NDFveDB2a3l3eGxzIn0.-En_lmcLWHl0K-udYl5gwQ';

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
        drawRoad(points, 'road_' + String(i), data[i])
    }
});

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

    const popup = new mapboxgl.Popup({offset: 25})
        .setHTML(`
                    <div class='popup_mapbox'>
                        <p>${text1}</p>
                        ${text2}
                    </div>
                `);
    // Add markers to the map.
    // делаем 2 маркера на long lat - один черный на фоне как максимум другой зелено-красный который показывает насколько пизда этому метро

    let marker = new mapboxgl.Marker(el)
        .setLngLat([long, lat])
        .setPopup(popup)
        .addTo(map);
}

const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

function drawRoad(points, road_id, road_data) {
    let road_desc = `<h2>В час пик на этой дороге:</h2>
                    <h4>С востока на запад:</h4>
                    <p>${road_data.east_to_west_auto_per_hour} машин в час, она загружена на ${road_data.east_to_west_load_percent}%</p>
                    <h4>С запада на восток:</h4>
                    <p>${road_data.west_to_east_auto_per_hour} машин в час, она загружена на ${road_data.west_to_east_load_percent}%</p>`
    map.addSource(road_id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {
                'description': road_desc
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': points
            }
        }
    })

    let percent = Math.max(road_data.east_to_west_load_percent, road_data.west_to_east_load_percent);
    let Red = Math.round((255 * (percent / 100)))
    let Green = 255 - Math.round(255 * (percent / 100))
    let Blue = 0

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
            'line-color': percent === 0 ? '#000000' : `rgb(${Red}, ${Green}, ${Blue})`,
            'line-width': 6
        }
    });
    map.on('mouseenter', road_id, (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.lngLat;
        const description = e.features[0].properties.description;

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
        console.log(e.target.id)
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
