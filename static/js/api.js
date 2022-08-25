const API_URL = '/api/v1/';

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

async function getTransportLocationData() {
    return await (await fetch(API_URL + 'TransportLocation?type=json')).json();
}

async function getRoadData() {
    return await (await fetch(API_URL + 'Road?type=json')).json();
}
