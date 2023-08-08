const Tour = require('../models/tourModel')
const APIFreatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')  
const AppError = require('../utils/appError') 

// HANDLER FUNCTIONS

exports.aliasTopTours = async (req,res,next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,affluence'
    next()
}


// GET all tours
exports.getAllTours = catchAsync(async (req, res,next) => {
    // Execute the query
    const features = new APIFreatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitedFields()
    .paginate()
    const tours = await features.query

    // Send response
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data:{
            tours
        }
    })
})

// GET single tour
exports.getTour = catchAsync(async(req, res,next) => {
    const tour =  await Tour.findById(req.params.id)
    //                 Tour.findOne(_id: req.params.id)
        /* console.log(req.params); // req.params -> /:id
    // multiply a string that looks like a number ( '5' , '4') by a real number, 
    // it automatically converts the string to a number
     const id = req.params.id * 1 
    */

    if(!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }
        
    res.status(200).json({
        status: 'success',
        data:{
            tour
        }
     })
})


// CREATE tour
exports.createTour = catchAsync(async (req, res,next) =>{
    const newTour = await Tour.create(req.body)

    res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    }   
 )

 // UPDATE tour
exports.updateTour = catchAsync(async(req, res,next) =>{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true 
    })

    if(!tour) return next(new AppError('No tour found with that ID', 404))

    res.status(200).json({
        status: 'success',
        data:{
            tour
        }
    })
})

// DELETE tour
exports.deleteTour = catchAsync(async(req, res,next) =>{
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if(!tour) return next(new AppError('No tour found with that ID', 404))

    res.status(204).json({
        status: 'success',
        data: 'null'
    })
})


exports.getTourStats = catchAsync(async(req, res,next) => {
    const stats = await Tour.aggregate([
        { 
            $match: {
                ratingsAverage: {$gte: 4.5}
            }
        },
        { 
            $group: {
                _id: '$affluence',
                numTours : {$sum: 1},
                numRatings: {$sum :'$ratingsQuantity'},
                avgRating: { $avg:'$ratingsAverage'},
                avgPrice: { $avg:'$price'},
                minPrice: { $min:'$price'},
                maxPrice: { $max:'$price'}
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) =>{
    const year = req.params.year * 1; // 2022
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match:{
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id: {$month: '$startDates'},
                numTourStarts: { $sum: 1},
                tours: { $push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project:{
                _id: 0
            }
        },
        {
            $sort:{numTourStarts: -1}
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})