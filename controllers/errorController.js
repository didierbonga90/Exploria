const AppError = require('./../utils/appError')

const handleCastError = err =>{
    const message = `Invalid ${err.path} : ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)
    const message = `Duplicate field value : ${value}. Please use another value!`
    return new AppError(message,400)
}


const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid Input data. ${errors.join('.')}`
    return new AppError(message, 400)
}

const handleJWTerror = () => new AppError('Invalid token, please log in again!', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired, please log in again!', 401)

const sendErrorDev = (err, req, res) => {
    // A) API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
   
    // B) RENDERED ERROR PAGE
    console.error('ERROR😣', err)
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    })
}

const sendErrorProd = (err, req, res) => {
    // A) API
    if(req.originalUrl.startsWith('/api')){
        // a) Operational : trusted error : send message to client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })

        }

        // b) Programming or other unknown error : don't leak error details
        // log the error 
        console.error('ERROR😣', err)

        // Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'something went very wrong!'
        })
    }

    // B) RENDERED ERROR PAGE
    // A) Operational : trusted error : send message to client
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    }
    // B) Programming or other unknown error : don't leak error details
    // log the error 
    console.error('ERROR😣', err)

    // Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later!'
    })
}


module.exports = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res)
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = {...err}
        error.message = err.message

        if(error.name === 'CastError') error = handleCastError(error)
        if(error.code === 11000) error = handleDuplicateFieldsDB(error)
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if(error.name ==='JsonWebTokenError') error = handleJWTerror()
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError()

        sendErrorProd(error, req, res)
    }
}
