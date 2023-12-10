const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const db = require('../db')

const tourSchema = new mongoose.Schema({
    // Schema definition
    name: {
        type: String,
        required: [true, 'Name is a required field'],
        trim: true,
        maxlength: [40, 'A tour must have a maximum of 40 characters'],
        minlength: [5, 'A tour must have at least 5 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain alpha characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'Duration is a required field']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Max group size is a required field']
    },
    affluence :{
        type: String,
        required: [true, 'Affluence is a required field'],
        // enum : to specify what kind of affluence is allowed
        enum: {
            values:['low', 'medium', 'high'],
            message: 'Affluence is either low, medium or high'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 2.666666 -> 2.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is a required field']
    },
    priceDiscount: { 
        type: Number,
        // custom validator
        validate: {
            validator: function (val){
                return val < this.price // return the discount price if it is < price
            },
        message: 'Discount Price ({VALUE}) must be below the regular price' // ({VALUE}) -> to have access to the actual value
        }
    },
    summary:{
        type: String,
        trim: true,
        required: [true, 'Summary is a required field']
    },
    description:{
        type: String,
        trim: true
    },
    // we don't need the image itself in the database
    // we need the name of the image which we'll be able to read on the file system
    imageCover:{
        type: String,
        required: [true, 'Cover Image is a required field']
    },
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour:{
        type: Boolean,
        default: false
    },
    startLocation:
    {
        // GeoJSON
        type:{
            type: String,
            default: 'Point', // can be polygons,lines or other mongoDB geometry types 
            enum: ['Point']
        },
        coordinates: [Number], // we expect an array of numbers
        address: String,
        description: String,
    },
    locations:[
        {
            type:{
                type: String,
                default: 'Point', 
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // guides: Array -> for embeeding implementation of guides
    guides: [
        {
            type:mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, 
{
    /* Schema options -> to make sure that when we have a virtual property ( a field that
        is not stored in the DB) , we want this to also show up whenever there is an output */
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
});

// Virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Use indexes for improving read performance
tourSchema.index({price: 1, ratingsAverage: -1}) // 1 -> sorting prices in ASC order | -1 -> sorting prices in DESC order
tourSchema.index({slug: 1})
tourSchema.index({startLocation: '2dsphere'}) // 2dsphere is an index for geospatial queries 

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// DOCUMENT MIDDLEWARE : runs before .save() .create()
// pre save middleware (or pre save hooks)
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name), {lower:true};
    next()
});

// /* IMPLEMENT EMBBEDING FOR NEW TOUR : 
// Allows us to implement the ID of any guide in an array and 
// return the full information of each guide with the corresponding ID
// that we implemented.
// This works just for creating document
// */ 
// tourSchema.pre('save',async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })



// tourSchema.post('save', function (doc,next) {
//     console.log(doc);
//     next()
// })

// Query Middleware
tourSchema.pre(/^find/, function (next){ // /^find/ -> every search starts with find ( find, findById, findOne, findOneAndUpdate ...)
    this.find({ secretTour: {$ne: true} })

    // To mesure how long it takes to execute the current query
    this.start = Date.now();
    next()
});


tourSchema.pre(/^find/, function (next){
    this.populate({
        path:'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

// // Aggregation Middleware
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({ $match :{ secretTour: {$ne: true}}})
//     console.log(this.pipeline())
//     next()
// })

tourSchema.post(/^find/, function (docs,next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next()
});


const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour