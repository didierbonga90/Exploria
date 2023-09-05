const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')  
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

// filterObj -> to filter the whole body (req.body) and extract just the elements we need
const filterObj = (obj, ...allowedFields) =>{
    const newObj = {}
    Object.keys(obj).forEach(el => { // Object.keys(obj) to loop through an entire object, and for each element in this entire object
        if(allowedFields.includes(el)) newObj[el] = obj[el] // if the element is included in the allowed elements, create a new object and add the element there
    })
    return newObj
}

// GET USER ACCOUNT
exports.getMe = catchAsync(async(req, res, next) =>{
    req.params.id = req.user.id
    next()
})

// UPDATE CURRENT AUTHENTICATED USER
exports.updateMe = catchAsync(async(req, res, next) =>{
    
    // Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.'))
    }
    
    // Filtered out unwanted fields names that are not allowed to be updated (so that we mention the only one we want)
    const filteredBody = filterObj(req.body, 'name', 'email') // filterObj -> here to extract just name and email
    
    // update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { 
        /* x is req.body but since we don't want to update everything, we put x that represents name and email.
        the 2 fields that we want to allow to update
        */
       new: true, 
       runValidators: true
    })
    
    res.status(200).json({
        status: 'success',
        data:{
            user: updatedUser
        }
    })
})


// DELETE USER ACCOUNT
exports.deleteMe = catchAsync(async(req, res, next)=>{
    const user = await User.findByIdAndUpdate(req.user.id, {active: false})
    
    res.status(204).json({
        status: 'success',
        data: null
    })
    console.log(user)
})


exports.createUser = (req, res) =>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use sign up instead!'
    })
}

// DO NOT update password with this (This update is only for ADMIN)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)