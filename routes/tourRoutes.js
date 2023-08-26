const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes')
// router.param('id', tourController.checkID);

router.route('/top-5-cheap-tours').get(tourController.aliasTopTours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
.route('/')
.get(authController.protect, tourController.getAllTours) // auth.protect runs first and protects the tourControllers.getAllTours from unlogged in users
.post(tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour)

// // Nested routes -> example, getting and posting review route from tour id route
// // POST/tour/tourID/reviews
// // GET/tour/tourID/reviews
// // POST/tour/tourID/reviews/reviewID
// router
// .route('/:tourId/reviews')
// .post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

// this best practice means -> app.use('/api/v1/tours', tourRouter) then ('/:tourId/reviews', reviewRouter)
// /api/v1/tours/:tourId/reviews
router.use('/:tourId/reviews', reviewRouter)

module.exports = router
