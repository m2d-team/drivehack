let calc_button = document.getElementById('calc-button');

let necessary_params = [
    'build-type',
    'building-area'
];

const form = document.getElementById('form')
form.addEventListener('change', (e) => setFormParam(e));

let params_data = [];
for (let i = 0; i < 5; i++) {
    params_data.push({
        'build-type': null,
        'build-area': null,
        'd-people': null,
        'd-workers': null,
    })
}

function saveFormData() {
    let curr_build = Number(document.getElementById('current-build').value)
    params_data[curr_build]['build-type'] = document.getElementById('build-type').children[1].value
    params_data[curr_build]['build-area'] = document.getElementById('build-area').children[1].value
    params_data[curr_build]['d-people'] = document.getElementById('d-people').children[1].value
    params_data[curr_build]['d-workers'] = document.getElementById('d-workers').children[1].value
}

function setFormData(param_data) {
    saveFormData()
    document.getElementById('build-type').children[1].value = param_data['build-type']
    document.getElementById('build-area').children[1].value = param_data['build-area']
    document.getElementById('d-people').children[1].value = param_data['d-people']
    document.getElementById('d-workers').children[1].value = param_data['d-workers']
}

function setFormParam(e) {
    let build_id = e.target.parentElement.parentElement.children[0].value;
    console.log(build_id)
    let param_name = e.target.parentElement.id;
    let param_value = e.target.value;

    params_data[build_id][param_name] = param_value;

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

// функция для активации кнопки расчёта (если введены все данные)
function checkFilledParams() {
    for (const [key, value] of Object.entries(params_data)) {

        if (necessary_params.includes(key) && value === null) {
            calc_button.classList.add('disabled');
            console.log('Not enough necessary params');
            return;
        }
    }

    // кол-во рисунков
    const data = draw.getAll();

    if (area_counter === 0) {
        console.log('Zone not specified');
        calc_button.classList.add('disabled');
        return;
    }

    calc_button.classList.remove('disabled');
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const loader = document.getElementById('spinner-loader');

    // ждём пока обрабатывается запрос
    loader.classList.remove('hidden');

    // тут у нас ебейший запрос к api
    sendData(params_data, getAllCoordinates());

})

