mapboxgl.accessToken = 'pk.eyJ1IjoidmVyeWJpZ3NhZCIsImEiOiJjbDc4MTUzcmEwNWV1NDFveDB2a3l3eGxzIn0.-En_lmcLWHl0K-udYl5gwQ';


const API_URL = 'localhost:8000/api/v1';

// создание карты + рисовалки на карте

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
    // defaultMode: 'draw_polygon'
});
map.addControl(draw);
// привязка ивентов для подсчета говна слева при апдейте рисунка
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);


// во время загрузки
map.on('load', () => {
    console.log('loaded')
    fetch('/api/v1/TransportLocation?type=json').then((resp) => {
        resp.json().then((data) => {
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

            // добавляем слой на котором они могут быть прорисованы
            map.addLayer({
                'id': 'places',
                'type': 'symbol',
                'source': 'places',
                'layout': {
                    'icon-image': '{icon}',
                    'icon-allow-overlap': true
                }
            });

        })
        ;
        // resp - список значений TransportLocation, где longitude и latitude - наши координаты
        // крч надо это на карту залить

    })

    // дороги
    fetch('/api/v1/Road?type=json').then((resp) => {
        resp.json().then((data) => {
            for (let i = 0; i < data.length; i++) {
                let points = []
                for (let j = 0; j < data[i].drawing_points.length; j++) {
                    points.push([data[i].drawing_points[j].longitude, data[i].drawing_points[j].latitude])
                }
                drawRoad(points, 'road_' + String(i))
            }
        })
    })
});

function drawRoad(points, road_id) {
    map.addSource(road_id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
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
    let marker = new mapboxgl.Marker(el)
        .setLngLat([long, lat])
        .setPopup(popup)
        .addTo(map);
}


// let calc_button = document.getElementById('calc-button');

function getDataFromFrom(){
    let category = document.getElementById('category');

    if(data.features.length == 0){
        console.log('Zone not specified');
        calc_button.classList.add('disabled');
        return;
    }

    calc_button.classList.remove('disabled');
}

function receivingDataFromAPI(){
    console.log('API response received...');
    
    const loader = document.getElementById('spinner-loader');
    const answer = document.getElementById('calculated-area');

    loader.classList.add('hidden');
    let polygon_count = getAllCoordinates().length;
    answer.innerHTML = `<p>У вас ${polygon_count} здания</p><br><p>А ещё в этот момент должна происходить перерисовка нагрузок</p>`;

}

calc_button.addEventListener('click', (e) => {
    const loader = document.getElementById('spinner-loader');
    
    console.log('API request sent...');
    // тут у нас будет ебейший запрос к api
    
    // ждём пока не придёт запрос
    loader.classList.remove('hidden');
    
    setTimeout(() => {
        // тут мы типа получили данные от api
        receivingDataFromAPI();
    }, 2 * 1000);

})

function updateArea(e) {
    checkFilledParams();
    // const data = draw.getAll();

    // if (data.features.length > 0) {
    // } else {
    //     answer.innerHTML = '';
    //     calc_button.classList.add('disabled');
    //     if (e.type !== 'draw.delete'){
    //         alert('Click the map to draw a polygon.');
    //     };

    // }
}


// points stuff
