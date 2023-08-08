const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

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
        max: [1, 'Rating must be below 5.0'],
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
    }
}, 
{
    // Schema options
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
});

// Virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// // Document Middleware : runs before .save() .create()
// // pre save middleware (or pre save hooks)
// tourSchema.pre('save', function (next) {
//     this.slug = slugify(this.name), {lower:true};
//     next()
// });

// tourSchema.post('save', function (doc,next) {
//     console.log(doc);
//     next()
// })

// Query Middleware
tourSchema.pre('/^find/', function (next){ // /^find/ -> every search starts with find ( find, findById, findOne, findOneAndUpdate ...)
    this.find({ secretTour: {$ne: true} })

    // To mesure how long it takes to execute the current query
    this.start = Date.now();
    next()
});

tourSchema.post('/^find/', function (docs,next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next()
});

// Aggregation Middleware
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match :{ secretTour: {$ne: true}}})
    next()
})

// 

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour