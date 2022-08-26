const API_URL = '/api/v1/';

function sendData(params_data_dict, time_of_day, points) {
    saveFormData()
    let xhr = new XMLHttpRequest();
    let url = `${API_URL}calculate`;
    xhr.open('POST', url);
    xhr.responseType = 'json';

    let coordinates = {
        'coordinates': getCoords()
    };

    let body = JSON.stringify(Object.assign({}, params_data, coordinates, time_of_day));
    xhr.send(body);

    const loader = document.getElementById('spinner-loader');
    xhr.onload = () => {
        console.log('test')
        // response arrived
        loader.classList.add('hidden');
        unlockBeforeAfterButton()
        after = xhr.response;
        changeColorsToResponse(xhr.response)
        let keys = Object.keys(popup_dict)
        setInterval(() => {
            document.querySelectorAll('#growth').forEach((el) => {
                el.innerHTML = `Прирост метро: ${after['metro_growth']} человек`

                console.log(el.innerHTML)
            })
        }, 1000)

    }
}

async function getTransportLocationData() {
    return await (await fetch(API_URL + 'TransportLocation?type=json')).json();
}

async function getRoadData() {
    return await (await fetch(API_URL + 'Road?type=json')).json();
}


// document.getElementById('test').addEventListener('click', () => {
//     console.log('???')

//     let xhr = new XMLHttpRequest();
//     let url = `${API_URL}calculate`;
//     xhr.open('POST', url);
//     xhr.responseType = 'json';

//     let body = JSON.stringify({'text': 'useless huinya'});

//     xhr.send(body);
//     xhr.onload = () => {
//         console.log(xhr.response)
//         after = xhr.response;

//         changeColorsToResponse(xhr.response)
//         unlockBeforeAfterButton()
//     }

// })
