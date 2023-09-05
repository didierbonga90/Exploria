const express = require('express')
const router = express.Router({ mergeParams: true }) // merge params -> to merge 2 routes, get access to a route from anpother route
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')


router.route('/')
.get(reviewController.getAllReviews)
.post(authController.protect, authController.restrictTo('user'),reviewController.setTourAndUserIds,reviewController.createReview)

router.route('/:id')
.get(reviewController.getReview)
.delete(reviewController.deleteReview)
.patch(reviewController.updateReview)

module.exports = router