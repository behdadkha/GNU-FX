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
            return res.json({ msg: "INVALID_EMAIL" })
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
                subject: "ToeFX Password Recovery",
                text: `${user.name},\n\nPlease click on the link below to reset your password. If you have not requested to reset your password, simply ignore this email.\n\n${urlTobeSent}\n\nThank you,\n\nToeFX Team`
            }
            
            //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //Needed for testing
            smtpTransport.sendMail(mailOption, (err, resp) => {
                if (err) {
                    console.log(err);
                    return res.json({ msg: "UNKNOWN_ERROR" })
                }
                else {
                    return res.json({ msg: "" }) //Indication of success is no error message being returned
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

function checkEmails(hashedEmail, textEmail) {
    return new Promise((Resolve, Reject) => {
        bcrypt.compare(textEmail, hashedEmail, (err, result) => {
            if (result)
                Resolve("VALID_EMAIL")
            else
                Resolve("INVALID_EMAIL")
        })
    });
}

forgotPasswordRoutes.route('/checkEmails').post( async (req, res) => {
    const response = await checkEmails(req.body.emailFromURL, req.body.emailInput);
    const password = req.body.password;

    if (response === "VALID_EMAIL") {
        userSchema.findOne({email: req.body.emailInput}, async (err, user) => {
            if (err || user === null) {
                return res.json({errorMsg: "INVALID_EMAIL"}); //Should never actually get here
            }
            else {
                const email = req.body.emailInput;

                //Hash the password
                const rounds = 10; //10 rounds of hashing
                user.password = await hashPassword(password, rounds);

                //Save the new encrypted password for security reasons
                user.save().then(() => {
                    res.status(200).json({errorMsg: "" }); //No error - success
                }).catch(err => console.log(err));
            }
        })
    }
    else {
        return res.json({errorMsg: "INVALID_EMAIL"});
    }
})

module.exports = forgotPasswordRoutes;
