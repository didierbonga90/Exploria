const { promisify } = require('util')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')
const jwt = require('jsonwebtoken')
const crypto = require('crypto') 

// TOKEN FUNCTION
const signToken = id =>{
    return jwt.sign(
        {id}, // user id from mongoDB
        process.env.JWT_SECRET, // the secret key. we configure it inside "config.env" file
        {expiresIn: "90d"} // expiration date -> 90 days
    )
}

// Create the token
const createAndSendToken = (user, statusCode, res) =>{
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000), // hours min sec milliseconds
        // secure: true, // the cookie will be sent on an encrypted connection (https://)
        httpOnly: true // the cookie cannot be accessed or modified by the browser (to prevent cross site attack)
    }
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true

    // remove the password from the output when we create user
    user.password = undefined

    // create a cookie
    res.cookie('jwt', token, cookieOptions)
    
    res.status(statusCode).json({
        status: 'success',
        token, // after creating the token, we send it to the client
        data:{
            user: user
        }
    })
}

// SIGN UP
exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body)
    createAndSendToken(newUser, 201, res)
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
    createAndSendToken(user, 200, res)
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

// FORGOT PASSWORD (reset token)
        // user sends a post request to a forgot password route only with this email address
        // and this would then create a reset token an send that to the email address that was provided
exports.forgotPassword = catchAsync(async (req, res, next) =>{
    // get user based on POSTed email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with that email address!',404))
    }

    // generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false }) // validateBeforeSave -> to deactivate all the validators that we specified in our schema

    // send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forgot Password ? Submit a PATCH request with your new password and passwordConfirm to : 
                    ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        return next(new AppError('There was an error sending the email. Try again later!', 500))
    }
   
})


// RESET PASSWORD (setting the new password)
exports.resetPassword = catchAsync(async (req, res, next) =>{
    // Get the user based on the token
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}}) 

    // If token has not expired AND there is a user, set the new password
    if(!user){
        return next( new AppError('Token is invalid or has expired!', 400))
    }
    user.password = req.body.password // Set the new password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // Update changePasswordAt property for the user
    // Log the user in, send JWT
    createAndSendToken(user, 200, res)
})


// UPDATE THE CURRENT PASSWORD
exports.updatePassword = catchAsync(async(req, res, next) =>{
    // Get the user from the database
    const user = await User.findById(req.user.id).select('+password')
    
    // Check if the POSTed password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('The current password is incorrect!', 401))
    }

    // If correct, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // Log user in, send JWT
    createAndSendToken(user, 200, res)
})


