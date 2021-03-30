/*
    Routes for sending email to reset password.
*/

const express = require('express');
const forgotPasswordRoutes = express.Router();
const utils = require('../utils');
const userSchema = require('../database/userSchema');
const config = require('../config');
const bcrypt = require('bcryptjs');


/*
    Checks if the user entered to correct email for the recovery link.
    param hashedEmail: The email the recovery link was generated for.
    param textEmail: The email the user entered.
    returns: A resolution to a promise with whether or not the email was valid.
*/
function checkEmails(hashedEmail, textEmail) {
    return new Promise((Resolve, Reject) => {
        bcrypt.compare(textEmail, hashedEmail, (err, result) => { //Hash the input email and compare it
            if (result)
                Resolve("VALID_EMAIL");
            else
                Resolve("INVALID_EMAIL");
        })
    });
}

/*
    Endpoint: /forgotpassword
    Sends an email to a user with a link to reset their password.
    body param email: The email of the user who requested the password reset.
    returns: In res, an object with the following member:
                msg: An error type if any occurred.
*/
forgotPasswordRoutes.route('').post((req, res) => {
    userSchema.findOne({email: req.body.email }, async (err, user) => {
        if (err || user === null) {
            return res.json({msg: "INVALID_EMAIL"});
        }
        else {
            const email = req.body.email;
            var urlTobeSent = await utils.hashedURL(email, "forgotpassword");
            const subject = "ToeFX Password Recovery";
            const text = `${user.name},\n\nPlease click on the link below to reset your password. If you have not requested to reset your password, simply ignore this email.\n\n${urlTobeSent}\n\nThank you,\n\nToeFX Team`;
            utils.sendEmail(email, subject, text);
            return res.json({msg: ""});
        }
    })
})

/*
    Endpoint: /forgotpassword/checkEmails
    Changes a user's forgotten password after they submitted a request to change it.
    body param emailFromURL: The email the recovery link was generated for.
    body param emailInput: The email the user entered.
    body param password: The new password the user entered.
    returns: In res, an object with the following member:
                msg: An error type if any occurred.
*/
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
                user.password = await utils.hashPassword(password, rounds);

                //Save the new encrypted password for security reasons
                user.save().then(() => {
                    res.status(StatusCode.SuccessOK).json({errorMsg: "" }); //No error - success
                }).catch(err => console.log(err));
            }
        })
    }
    else {
        return res.json({errorMsg: "INVALID_EMAIL"});
    }
})

module.exports = forgotPasswordRoutes;
