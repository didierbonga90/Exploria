const express = require('express');
const app = express();
const morgan = require('morgan');
const connectDB = require('./db')

connectDB()

// Mount our routers
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes');

//MIDDLEWARES -> use function to use middleware
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.json());


app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
    console.log('Test middleware')
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.requestTime)
    next();
})

// ROUTES
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app;