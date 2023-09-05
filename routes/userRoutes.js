const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

// Sign Up
router.post('/signup', authController.signup)

// Login
router.post('/login', authController.login)

// Reset password
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// Update current password for the logged in user
router.patch('/updatePassword', authController.protect, authController.updatePassword)

// Get user
router.get('/me', authController.protect, userController.getMe, userController.getUser)

// Update user
router.patch('/updateMe', authController.protect, userController.updateMe)

// Delete user (make him inactive from DB)
router.delete('/deleteMe', authController.protect, userController.deleteMe)


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