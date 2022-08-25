mapboxgl.accessToken = 'pk.eyJ1IjoidmVyeWJpZ3NhZCIsImEiOiJjbDc4MTUzcmEwNWV1NDFveDB2a3l3eGxzIn0.-En_lmcLWHl0K-udYl5gwQ';


// создание карты + рисовалки на карте

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [37.56809243178864, 55.773323644594456], // starting position [lng, lat]
    zoom: 15, // starting zoom
    pitchWithRotate: false
});

const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
    defaultMode: 'draw_polygon'
});
map.addControl(draw);

// привязка ивентов для подсчета говна слева при апдейте рисунка
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);



// мы ждем 4 секунды чтобы быть уверенными что карта вгрузилась и запрашиваем список остановок и на их местах рисуем говно
setTimeout(() => {
    console.log('loaded')
    fetch('/api/v1/TransportLocation?type=json').then((resp) => {
        resp.json().then((data) => {
            console.log(data)

            let features = []
            for (let i = 0; i < data.length; i++) {
                features.push({
                    'type': 'Feature',
                    'properties': {
                        'description': 'Здесь',
                        // TODO сюда иконку ебануть
                        // 'icon': 'theatre-15'
                        'icon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [data[i].latitude, data[i].longitude]
                    }
                })
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
}, 4000);

function getAllCoordinates() {
    // возвращает список списков пар координат (все полигоны)
    let features = draw.getAll().features
    let polygons = [];
    for (let i = 0; i < features.length; i++) {
        polygons.push(features[i].geometry.coordinates)
    }
    return polygons
}

// let calc_button = document.getElementById('calc-button');

function getDataFromFrom(){
    let category = document.getElementById('category');

    console.log(category.value);
}

function receivingDataFromAPI(){
    console.log('API response received...');
    
    const loader = document.getElementById('spinner-loader');
    const answer = document.getElementById('calculated-area');

    loader.classList.add('hidden');
    let polygon_count = getAllCoordinates().length;
    answer.innerHTML = `<p>У вас ${polygon_count} здания</p><br><p>А ещё в этот момент должна происходить перерисовка нагрузок</p>`;

}

// calc_button.addEventListener('click', (e) => {
//     const loader = document.getElementById('spinner-loader');
    
//     console.log('API request sent...');
//     // тут у нас будет ебейший запрос к api
    
//     // ждём пока не придёт запрос
//     loader.classList.remove('hidden');
    
//     setTimeout(() => {
//         // тут мы типа получили данные от api
//         receivingDataFromAPI();
//     }, 2 * 1000);

// })

function updateArea(e) {
    const data = draw.getAll();

    if (data.features.length > 0) {
        // calc_button.classList.remove('disabled');
    } else {
        // answer.innerHTML = '';
        // calc_button.classList.add('disabled');
        if (e.type !== 'draw.delete'){
            alert('Click the map to draw a polygon.');
        };

    }
}


// points stuff
