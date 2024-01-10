const express = require('express');
const app = express();
const morgan = require('morgan');
const connectDB = require('./db')
const path = require('path')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

// DB Connectivity
connectDB()

// Error handlers
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')


// Mount our routers
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')

// View engine 
app.set('view engine','pug')
app.set('views', path.join(__dirname,'views'))

// GLOBAL MIDDLEWARES -> use function to use middleware

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV)

// Set security HTTP headers with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true, 
        directives: { 
        'script-src': ["'self'", "https://cdnjs.cloudflare.com/" ]  
        }
    }
}))

// Limit requests from same API
const limiter = rateLimit({
    max: 100, // the max number of requests for one IP
    windowMs: 60 * 60 * 1000,
    message: 'Too many request for this IP, please try again in an hour' // error 429 
})
app.use('/api',limiter)

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize())
 
// Data Sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsAverage',
        'ratingsQuantity',
        'maxGroupSize',
        'affluence',
        'price'
    ]
}))

// Body-parser -> reading data from body into req.body
app.use(express.json({limit: '10kb'})); // limit the body to 10kilobytes, parses the data from body
app.use(cookieParser());  // parses the data from cookie
app.use(express.urlencoded({extended: true, limit: '10kb'})); // urlencoded - to parse the data coming from an url encoded form


// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies)
    next();
})

// ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)


// Global Handling Errors 
app.all('*', (req,res,next) =>{ // ALL is for all the http methods (GET, POST ...)
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
}) 

app.use(globalErrorHandler)

module.exports = app;