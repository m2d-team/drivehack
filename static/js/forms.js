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

function clearFields() {
    forms.forEach((el) => {
        let key = el.id;
        el.children[0].value = '';

        params_data[key] = null;
    });
    return;
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

