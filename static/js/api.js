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
    console.log(body);
    xhr.send(body);

    const loader = document.getElementById('spinner-loader');
    xhr.onload = () => {
        // loader.classList.add('hidden');
        console.log(xhr.response);
        // response arrived
        changeColorsToResponse(xhr.response)
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
