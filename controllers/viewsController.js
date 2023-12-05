const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1 - get tour data from collection
    const tours = await Tour.find()

    // 2 - build template

    // 3 - render that template using tour data from step 1
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({ path: 'reviews', fields: 'review rating user'})

    // Error page if there is no corresponding tour
    if(!tour) return next(new AppError('There is no tour with that name!', 404)) 

    res.status(200).render('tour', {
        title:`${tour.name} tour`,
        tour
    })
})


exports.getLoginForm = catchAsync(async(req, res, next) => {
    res.status(200).render('login', {
        title:'Log into your account'
    })
})