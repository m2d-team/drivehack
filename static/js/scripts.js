// TODO:
// prevent default для форм

mapboxgl.accessToken = 'pk.eyJ1IjoidmVyeWJpZ3NhZCIsImEiOiJjbDc4MTUzcmEwNWV1NDFveDB2a3l3eGxzIn0.-En_lmcLWHl0K-udYl5gwQ';


const API_URL = '/api/v1/';

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
                drawRoad(points, 'road_' + String(i), data[i])
            }
        })
    })
});


// Create a popup, but don't add it to the map yet.
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

    function componentToHex(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

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
            'line-color': percent === 0 ? `rgb(${Red}, ${Green}, ${Blue})` : '#000000',
            'line-width': 6
        }
    });
    map.on('mouseenter', road_id, (e) => {
// Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

// Copy coordinates array.
        const coordinates = e.lngLat;
        const description = e.features[0].properties.description;

// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

// Populate the popup and set its coordinates
// based on the feature found.
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


let calc_button = document.getElementById('calc-button');

let necessary_forms = [
    'category-form',
    'square-form'
];

let forms = [
    document.getElementById('category-form'),
    document.getElementById('square-form'),
    document.getElementById('d-people'),
    document.getElementById('d-workers'),
];

let params_data = {
    'category-form': null,
    'square-form': null,
    'd-people': null,
    'd-workers': null,
};

forms.forEach(el => {
    el.addEventListener('change', (e) => setFormParam(e));
});

function setFormParam(e) {
    let param_name = e.target.parentElement.id;
    let param_value = e.target.value;

    params_data[param_name] = param_value;

    checkFilledParams();
}

// функция для активации кнопки расчёта(если введены все данные)
function checkFilledParams() {
    for (const [key, value] of Object.entries(params_data)) {

        if (necessary_forms.includes(key) && value === null) {
            calc_button.classList.add('disabled');
            console.log('Not enough necessary params');
            return;
        }
    }

    const data = draw.getAll();
    console.log(data.features.length);

    if (data.features.length == 0) {
        console.log('Zone not specified');
        calc_button.classList.add('disabled');
        return;
    }

    calc_button.classList.remove('disabled');
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

function clearFields() {
    forms.forEach((el) => {
        let key = el.id;
        el.children[0].value = '';

        params_data[key] = null;
    });
    return;
}

function sendData(data) {
    let xhr = new XMLHttpRequest();

    let url = `${API_URL}calculate`;
    xhr.open('POST', url);
    xhr.responseType = 'json';

    let coordinates = {
        'coordinates': getCoords()
    };

    let body = JSON.stringify(Object.assign({}, params_data, coordinates));
    
    clearFields();

    xhr.send(body);

    const loader = document.getElementById('spinner-loader');
    xhr.onload = () => {
        loader.classList.add('hidden');
        console.log(xhr.response);
    }
}

calc_button.addEventListener('click', (e) => {
    const loader = document.getElementById('spinner-loader');

    console.log('API request sent...');
    // ждём пока обрабатывается запрос
    loader.classList.remove('hidden');

    // тут у нас ебейший запрос к api
    sendData(params_data);


    // setTimeout(() => {
    //     // тут мы типа получили данные от api
    //     receivingDataFromAPI();
    // }, 2 * 1000);

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

document.getElementById('test').addEventListener('click', () => {
    console.log('???')

    let xhr = new XMLHttpRequest();
    let url = `${API_URL}calculate`;
    xhr.open('POST', url);
    xhr.responseType = 'json';

    let body = JSON.stringify({'text': 'useless huinya'});

    xhr.send(body);
})

// points stuff
