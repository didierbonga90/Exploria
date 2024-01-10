const nodemailer = require('nodemailer')
const pug = require('pug')
const {convert} = require('html-to-text')

module.exports = class Email {
    constructor(user, url){
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Louis Marcel Didier Bonga <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            // Sendgrid
            return 1
        }
        // Create a transporter -> a service that will actually send the email 
        return nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth:{
                user: "2203cf13d80892",
                pass: "8630b3fc2d8163"
            }
        })
    }

    // send the actual email
    async send(template, subject){
        // Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        })

        // Define the email options 
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html)
        }

        // Create a transport and send email (    // Actually send the email with nodemailer)
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Exploria World!')
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token ()valid for 10 minutes!')
    }
}
