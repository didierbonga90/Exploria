const express = require('express')
const router = express.Router({ mergeParams: true }) // merge params -> to merge 2 routes, get access to a route from anpother route
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')

// protect all reviews routes from unlogged in users
router.use(authController.protect)

router.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTo('user'),reviewController.setTourAndUserIds,reviewController.createReview)

router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview)

module.exports = router