const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const APIFeatures = require("./../utils/apiFeatures")

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) return next(new AppError(`No document found with that ID`, 404))

    res.status(204).json({
        status: 'success',
        message: 'deleted successfully',
        data: 'null'
    })
})


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!doc) return next(new AppError('No document found with that ID', 404))

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})


exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    // query is the normal request for a single document 
    let query = Model.findById(req.params.id)
    // if there is a popOptions, it will populate the document with the popOptions
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) return next(new AppError('No document found with that ID', 404))

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})


exports.getAll = Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}

    // Execute the query
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    // const doc = await features.query.explain();
    const doc = await features.query

    // Send response
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    })
})