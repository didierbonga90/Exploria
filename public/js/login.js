
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


// ************************************STRIPE*************************************

// const stripe = Stripe('pk_test_51OMWf8AXgmQc5z4J0TrqsnD8umKy2T6RTeQnTa3prhqu9LT5lAGoDQpfhYv7AvIWG8e3jicqb3mQYOUL2RGrsaBQ00LxJeqnft')

export const bookTour = async tourId =>{
    try {
        // get the session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`) 
    
        // create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (error) {
        console.log(error)
        showAlert('error'. err)
    }
    
}

const bookBtn = document.getElementById('book-tour')

if(bookBtn){
     bookBtn.addEventListener('click', e =>{
        e.target.textContent = 'Processing...'
        const {tourId} = e.target.dataset
        bookTour(tourId)
     })
}

//*********************************************************************************/




// ************************************LOGIN***************************************/
export const login = async(email,password) =>{
    try {
        const result = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
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


const loginForm = document.querySelector('.form--login')
if(loginForm){
    loginForm.addEventListener('submit', e =>{
        e.preventDefault()
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password)
    })
}
//*********************************************************************************/





// ************************************LOGOUT***************************************/

export const logout = async() =>{
    try{
        const result = await axios({
            method: 'GET', // we don't post any info, but we GET a cookie by
            url: '/api/v1/users/logout'
        })

        if(result.data.status = 'success') location.reload(true) // reload the page automatically after logging out
    }
    catch(error) {
        showAlert('error', 'Error Logging out! Try again!')
    }
}

const logoutBtn = document.querySelector('.nav__el--logout')
if(logoutBtn) logoutBtn.addEventListener('click', logout)

//*********************************************************************************/





// ************************************UPDATE DATA********************************

export const updateSettings = async(data,type) => { // type is either password or data
    try {
        const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe'
        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if(res.data.status === 'success') showAlert('success', `${type.toUpperCase()} Updated Successfully!`)
    } catch (error) {
        showAlert('error', error.response.data.message)
    }
}


const userDataForm = document.querySelector('.form-user-data')
if(userDataForm){
    userDataForm.addEventListener('submit', e =>{
        e.preventDefault()
        const form = new FormData()
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])

        updateSettings(form, 'data')
    })
}
// *******************************************************************************





// ***************************** PASSWORD ****************************************
const passwordForm = document.querySelector('.form-user-password')
if(passwordForm){
    passwordForm.addEventListener('submit',async e =>{
        e.preventDefault()
        document.querySelector('.btn--save-password').textContent = 'Updating...'

        const passwordCurrent = document.getElementById('password-current').value; 
        const password = document.getElementById('password').value; 
        const passwordConfirm = document.getElementById('password-confirm').value; 

        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password')

        document.querySelector('.btn--save-password').textContent = 'Save Password'
        document.getElementById('password-current').value = ''
        document.getElementById('password').value = '' 
        document.getElementById('password-confirm').value = '' 
    })
}

// *******************************************************************************



// const locations = JSON.parse(document.getElementById('map').dataset.locations) // dataset -> because it's from data-locations (locations become a part of dataset)
// console.log(locations)

// mapboxgl.accessToken = 'pk.eyJ1IjoiZGlkaWVyMjI1IiwiYSI6ImNsbXkzb3Z5YjB3MTkyc3BoeTF1NHplYmQifQ.fVdPrN0d7T5K4vCQPkCkRQ'
// var map = new mapboxgl.Map({
//    container: 'map',
//    style: 'mapbox://styles/mapbox/streets-v11'
// });
