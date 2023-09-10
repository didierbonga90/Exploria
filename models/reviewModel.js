const mongoose = require('mongoose')
const Tour = require('../models/tourModel')

const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating:{
        type: Number,
        min: [1,'rating must be above 1'],
        max: [5,'rating must be below 5.0']
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user!'],
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour!'],
    },
},
{
    // Schema options 
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
})

// Avoid duplicate review
reviewSchema.index({tour: 1, user: 1}, {unique: true})

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

// We ususally use instance method, let's use static method to calculate the real rating average
reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: { // to select all the review of //*the specific tour (tourId)
                tour: tourId
            }
        },
        {
            $group: { 
                _id: '$tour', // we first specify the id
                nRating: {$sum: 1}, // number of rating : we add 1 for each tour that was matched in the previous step
                avgRating: {$avg: '$rating'} // now we calculate the rating average
            }
        }
    ])
    console.log(stats)
    
    if(stats.length > 0){
        // Now we update the tour with its real value of rating average
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save', function(){
    // this points to current review
    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne().clone()
    console.log(this.r)
    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review