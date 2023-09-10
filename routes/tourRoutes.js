const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes')
// router.param('id', tourController.checkID);

router.route('/top-5-cheap-tours').get(tourController.aliasTopTours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);


// Geospatial routes
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
// tours-distance?distance=233&center=37,122&unit=mi (url not clean)
// tours-distance/233/center/37,122/unit/mi  (url looks cleaner)

// Geospatial aggregation  - calculating distances
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
.route('/')
.get(tourController.getAllTours) 
.post(authController.protect, authController.restrictTo('admin','lead-guide'),tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.updateTour)
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
