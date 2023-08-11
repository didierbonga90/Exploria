const dotenv = require('dotenv');
dotenv.config({path: './config.env'})
const app = require('./app');

// UNCAUGHT EXCEPTION (should be always at the tiop of our code to catch all exceptions)
process.on('uncaughtException', err =>{
    console.log(err.name, err.message)
    console.log('UNCAUGHT EXCEPTION')
    process.exit(1) // exit is mandatory here
})

// START THE SERVER
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>{
    console.log(`Listening on ${process.env.NODE_ENV} mode on port ${PORT}...`)
})

// UNHANDLED REJECTIONS (For asynchounous code)
process.on('unhandledRejection', err =>{
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION')
    server.close(() =>{
        process.exit(1) // exit is optional here
    })
})


