
// ************************************ALERTS*************************************
// hide alert
export const hideAlert = () =>{
    const el = document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el)
}


// type is 'success' or 'error
export const showAlert = (type, msg) =>{
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
    window.setInterval(hideAlert, 5000)
}
//*********************************************************************************/


// ************************************LOGIN*************************************
export const login = async(email,password) =>{
    try {
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })

        if(result.data.status === 'success'){
            showAlert('success','Logged in successfully!')
            window.setTimeout(() =>{
                location.assign('/')
            },1500)
        }
    
    } catch (error) {
        showAlert('error',error.response.data.message)
    }
    
}

const loginForm = document.querySelector('.form')
if(loginForm){
    loginForm.addEventListener('submit', e =>{
        e.preventDefault()
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log(email, password)
        login(email,password)
    })
}
//*********************************************************************************/




// const locations = JSON.parse(document.getElementById('map').dataset.locations) // dataset -> because it's from data-locations (locations become a part of dataset)
// console.log(locations)

// mapboxgl.accessToken = 'pk.eyJ1IjoiZGlkaWVyMjI1IiwiYSI6ImNsbXkzb3Z5YjB3MTkyc3BoeTF1NHplYmQifQ.fVdPrN0d7T5K4vCQPkCkRQ'
// var map = new mapboxgl.Map({
//    container: 'map',
//    style: 'mapbox://styles/mapbox/streets-v11'
// });
