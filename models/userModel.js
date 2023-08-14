const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto') // built-in nodejs crypto library to create random token but not for strong authentication

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please! tell us your name!']
    },
    email:{
        type: String,
        required: [true, 'email is a required field'],
        unique: true,
        lowercase: true, // convert all to lowercase
        validate:[validator.isEmail, 'Please provide a valid email']
    },
    photo:{
        type: String    
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'password is a required field'],
        minlength: 8,
        select: false // password will never show up in any output (postman, client side etc...) using select and set it to false
    },
    passwordConfirm:{
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This works on CREATE and SAVE, not findOne or Update
            validator:function(el){
                return el === this.password
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
})

userSchema.pre('save', async function(next) {
    // if the password has not been modified, then access the function and call the next middleware
    // Only run this function if the password was actually modified
    if(!this.isModified('password')) return next()

    // Hash the password with cost of 12 (salting the password)
    this.password = await bcrypt.hash(this.password, 12)

    // Delete passwordConfirm field
    this.passwordConfirm = undefined
    next()
})

// Instance method -> a method that is going to be available on all documents of a certain collection
/* we use bcrypt.compare to compare the original password the user entered and the hashed version on the db, 
since it's impossible to get the original back if it's hashed
*/
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword) 
}

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp){
    // if user has changed his password
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        console.log(changedTimeStamp, JWTTimestamp)
        return JWTTimestamp < changedTimeStamp 
    }

    // false means NOT changed
    return false
}


// For reset password
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User