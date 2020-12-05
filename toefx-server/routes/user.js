const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
//user schema
const userSchema = require("../database/userSchema");


//sends back user info for the myAccount page
//sends email for now...
userRoutes.route('/getUserInfo').get((req, res) => {
    try {
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        userSchema.findOne({ _id: userId }).then(data => {
            if (data) {
                res.json(data.email);
            } else {
                res.status(400).json({ msg: "not found" });
            }
        });

    } catch {
        console.log("Couldnt get users info at /getUserInfo");
    }
});

//sends back user's schedule
userRoutes.route('/getschedule').get((req, res) => {
    try {
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        userSchema.findOne({ _id: userId }).then(data => {
            if (data) {
                res.json(data.schedule);
            } else {
                res.status(400).json({ msg: "not found" });
            }
        });
    }
    catch (e) {
        console.log("Something happened when tried to get user schedule (might be an invalid user)");
    }
});

userRoutes.post('/resetPassword', (req, res) => {
    try {

        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        const { currentPassword, newPassword1, newPassword2 } = req.body;

        userSchema.findOne({ _id: userId }).then(user => {
            if (user) {
                //check if the currentpassword is correct
                bcrypt.compare(currentPassword, user.password).then(valid => {

                    if (valid) {
                        //if the passwords match
                        if (newPassword1 === newPassword2) {
                            //hash rounds
                            const rounds = 10
                            //hash the password
                            bcrypt.genSalt(rounds, (err, salt) => {
                                bcrypt.hash(newPassword1, salt, (err, hash) => {
                                    if (err) throw err;

                                    //saves the new password in Database
                                    user.password = hash;
                                    user.save().then(() => {

                                        res.status(200).json({msg : "password changed"});

                                    }).catch(err => console.log(err));
                                });
                            });
                        }
                    } else {
                        
                        return res.json({ msg: "Invalid password" });
                    }
                });

            } else {
                //user does not exist (invalid jwt)
                res.json({ msg: "not found" });

            }
        });

    } catch {
        console.log("Failed to reset password");
    }
});


module.exports = userRoutes;