const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')  
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const multer = require('multer');
const sharp = require('sharp')


// Store our file
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) =>{ // cb -> callback
//         cb(null, 'public/img/users')// null -> no error
//     },
//     filename: (req, file, cb) =>{
//         // user-341535345343-3232323.jpeg (user-id-currentTimeStamp.file_extension)
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image! please upload only images!', 400), false)
    }
}

// Upload images in users folder from a form
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
exports.uploadUserPhoto = upload.single('photo')

// Resizing photo 
exports.resizeUserPhoto = catchAsync( async(req, res, next) =>{
    if(!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`)
    
    next()
})


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
    if(req.file) filteredBody.photo = req.file.filename
    
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