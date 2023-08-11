const { promisify } = require('util')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')

// TOKEN FUNCTION
const signToken = id =>{
    return jwt.sign(
        {id}, // user id from mongoDB
        process.env.JWT_SECRET, // the secret key. we configure it inside "config.env" file
        {expiresIn: "90d"} // expiration date -> 90 days
    )
}

// SIGN UP
exports.signup = catchAsync(async(req, res, next) => {
    
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    // Create the token
    const token = signToken(newUser._id)
    res.status(201).json({
        status: 'success',
        token, // after creating the token, we send it to the client
        data:{
            user: newUser
        }
    })
})


// LOGIN
exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body

    // Check if email and password exist
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400))
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password') /* we show just email but we explicitly select the password from the db to verify if it's correct 
                                                                     +password -> "+" to select the field that is by default not selected */
    
    if(!user || !(await user.correctPassword(password, user.password))) { // password -> the candidate password | user.password -> the correct password
        return next(new AppError('Incorrect email or password', 401)) // 401 -> unauthorized credentials
    }

    // If everything's Ok, send token to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})

// PROTECTED TOUR ROUTE FUNCTION
exports.protect = catchAsync(async(req, res, next) =>{
    // Get the token and check if it exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access.', 401))
    }
    
    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded)

    // Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist', 401))
    }

    // Check if user changed password after the token was issued
    if(!currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('The user has changed password! Please log in again!', 401))
    }

    // GRANT ACCESS TO THE PROTECTED ROUTE
    req.user = currentUser
    next()
})


// USER ROLES AND PERMISSIONS
exports.restrictTo = (...roles) =>{
    return (req, res, next) =>{
        // roles is an array ['admin', 'lead-guide']. role=user
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }
}

// RESET PASSWORD (reset token)