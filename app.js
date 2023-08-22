const express = require('express');
const app = express();
const morgan = require('morgan');
const connectDB = require('./db')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

// DB Connectivity
connectDB()

// Error handlers
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

// Mount our routers
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')

// GLOBAL MIDDLEWARES -> use function to use middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV)

// Set security HTTP headers with Helmet
app.use(helmet())

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
app.use(express.json({limit: '10kb'})); // limit the body to 10kilobytes

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.requestTime)
    next();
})

// ROUTES
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)


// Global Handling Errors 
app.all('*', (req,res,next) =>{ // ALL is for all the http methods (GET, POST ...)
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
}) 

app.use(globalErrorHandler)

module.exports = app;