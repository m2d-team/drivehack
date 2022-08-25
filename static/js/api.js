const API_URL = '/api/v1/';

function sendData(params_data_dict, points) {
    saveFormData()
    let options = {
        method: 'POST',
        body: JSON.stringify({
            'params_data': params_data_dict,
            'points': points
        })
    }
    fetch(API_URL + 'calculate', options).then(()=>{
        // ахуеть пришел ответ
        alert('ответ пришел!!')
    })
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
