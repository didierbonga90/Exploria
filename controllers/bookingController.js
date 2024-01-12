const Tour = require('./../models/tourModel')
const Booking = require('./../models/bookingModel')
const catchAsync = require('./../utils/catchAsync')  
const AppError = require('./../utils/appError') 
const factory = require('./handlerFactory')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    // get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    const product = await stripe.products.create({
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
      });
      
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: `${tour.price}`,
        currency: 'usd',
    });

    // create the checkout session  
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
       
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,

        line_items: [{
            price: price.id,
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`
    })

    // create session as response
    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) =>{
    const {tour, user, price} = req.query

    if(!tour && !user && !price) return next()

    await Booking.create({tour, user, price})

    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
