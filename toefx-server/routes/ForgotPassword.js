/*
    Functions for validating whether or not an image is of a toe.
*/

const express = require('express');
const forgotPasswordRoutes = express.Router();
const utils = require('../utils');
const userSchema = require('../database/userSchema');
const { config } = require('../config.js');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
function hashedURL(email) {
    return new Promise((Resolve, Reject) => {
        const rounds = 10
        bcrypt.genSalt(rounds, (err, salt) => {
            bcrypt.hash(email, salt, (err, hash) => {
                // e.g url: http://localhost:3000/hashedemailaddress
                Resolve(`http://localhost:3000/forgotpassword/${hash}`)
            });
        });
    });

}
forgotPasswordRoutes.route('').post((req, res) => {
    userSchema.findOne({ email: req.body.email }, async (err, user) => {
        if (err || user === null) {
            return res.json({ msg: "Email address does not exist" })
        }
        else {
            const email = req.body.email
            var urlTobeSent = await hashedURL(email)
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "toefxdevteam@gmail.com",
                    pass: "Toefxdevteam123"
                }
            });
            var mailOption = {
                from: "toefxdevteam@gmail.com",
                to: req.body.email,
                subject: "ToeFX forgot password",
                text: `Hi ${user.name}, please click on the link below to reset your password. If you have not requested to reset your password, simply ignore this email. ${urlTobeSent} Thank you`
            }
            smtpTransport.sendMail(mailOption, (err, resp) => {
                if (err) {
                    return res.json({ msg: "Something went wrong" })
                }
                else {
                    return res.json({ msg: "An email has been sent to the email address." })
                }
            })
        }
    })
})

/*
    Hashes the given password.
    Param password: The text that needs to be hashed.
    Param hashRounds: The number of rounds the hash function should run.
    returns: A promise with the hash if resolved.
*/
function hashPassword(password, hashRounds) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(hashRounds, (error, salt) => {
            bcrypt.hash(password, salt, (error, hash) => {
                if (error)
                    throw error;

                //Return the hashed password
                resolve(hash);
            });
        });
    });
}

function checkEmails(HashedEmail, TextEmail) {
    return new Promise((Resolve, Reject) => {
        bcrypt.compare(TextEmail, HashedEmail, (err, result) => {
            if (result) {
                Resolve("Valid email")
            }
            else {
                Resolve("Invalid email")
            }
        })
    });
}
forgotPasswordRoutes.route('/checkEmails').post( async (req, res) => {
    const response = await checkEmails(req.body.emailFromURL, req.body.emailInput)
    const password1 = req.body.password
    const password2 = req.body.confirmPassword
    if (response === "Valid email") {
        userSchema.findOne({ email: req.body.emailInput }, async (err, user) => {
            if (err || user === null) {
                return res.json({ msg: "Email address does not exist" })
            }
            else {
                const email = req.body.emailInput
                if(password1 === password2){
                    //Hash the password
                    const rounds = 10; //10 rounds of hashing
                    user.password = await hashPassword(password1, rounds);

                    //Save the new encrypted password for security reasons
                    user.save().then(() => {
                        res.status(200).json({ msg: "Password Changed. Redirecting to Login page..." });
                    }).catch(err => console.log(err));
                }
                else{
                    return res.json({msg: "Passwords do not match"})
                }
            }
        })
    }
    else{
        return res.json({ msg: "Email address is not valid"})
    }
})
module.exports = forgotPasswordRoutes;
