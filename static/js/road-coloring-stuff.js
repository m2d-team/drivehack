document.getElementById('road-version').addEventListener('click', (e)=>{
    console.log('here')
    if (e.target.innerHTML === 'до') {
        e.target.innerHTML = 'после'
        changeColorsToResponse(after)
    } else {
        e.target.innerHTML = 'до'
        changeColorsToResponse(before)
    }
})
function unlockBeforeAfterButton() {
    document.getElementById('edits-text-span').hidden = false;
    document.getElementById('road-version').hidden = false;

}
