const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

// Sign Up
router.post('/signup', authController.signup)

// Login
router.post('/login', authController.login)

// Logout
router.get('/logout', authController.logout)


// Reset password
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// this middleware will protect all the routes after written after it
router.use(authController.protect)

// Update current password for the logged in user
router.patch('/updatePassword', authController.updatePassword)

// Get user
router.get('/me', userController.getMe, userController.getUser)

// Update user
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto,userController.updateMe) // single - because we want to update one single photo

// Delete user (make him inactive from DB)
router.delete('/deleteMe', userController.deleteMe)

// Only admin will have permission of those routes after this middleware
router.use(authController.restrictTo('admin'))

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router