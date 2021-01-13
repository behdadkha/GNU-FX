const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const utils = require('../utils');
//user schema
const userSchema = require("../database/userSchema");

/*
    Hashes the given password.
    Param password: the text that needs to be hashed.
    Param hashRounds: the number of rounds the hash function should run.
    returns a promise with hash if resolved.
*/
function hashPassword(password, hashRounds){
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(rounds, (err, salt) => {
            bcrypt.hash(newPassword1, salt, (err, hash) => {
                if (err) throw err;
    
                //return the hashed password
                resolve(hash);
                
            });
        });
        reject();
    });
    
}

/*
    Endpoint: /user/getUserInfo
    Finds the user in the database and returns their email and age.
    returns as the response: user's email address and age.
*/
userRoutes.route('/getUserInfo').get(async (req, res) => {
    try {
        const token = req.headers.authorization;
        let userId = utils.validateUser(token, res);

        let user = await utils.findPeople(userId, res);
        res.json({email: user.email, age: user.age});

    } catch {
        console.log("Couldnt get users info at /getUserInfo");
    }
});

/*
    Endpoint: /user/getschedule
    Finds the user in the database and return their schedule.
    returns as the response: user's schedule.
*/
userRoutes.route('/getschedule').get(async (req, res) => {
    try {
        const token = req.headers.authorization;
        let userId = utils.validateUser(token, res);

        let user = await utils.findPeople(userId, res);
        res.json(user.schedule);
    }
    catch (e) {
        console.log("Something happened when tried to get user schedule (might be an invalid user)");
    }
});

/*
    Endpoint: /user/resetPassword
    changes the user's password to a new password.
    Body Param currentPassword: the user's currently saved password. 
    Body Param newPassword1: the new password to replace the old password.
    Body Param newPassword2: same as the newPassword1.
*/
userRoutes.post('/resetPassword', async (req, res) => {
    try {

        const token = req.headers.authorization;
        let userId = utils.validateUser(token, res);

        const { currentPassword, newPassword1, newPassword2 } = req.body;

        let user = await utils.findPeople(userId, res);
        if (user) {
            //check if the currentpassword is correct
            bcrypt.compare(currentPassword, user.password).then(async (valid) => {

                if (valid) {
                    //if the passwords match
                    if (newPassword1 === newPassword2) {
                        //hash the password
                        const rounds = 10;
                        user.password = await hashPassword(newPassword1, rounds);

                        user.save().then(() => {
                            res.status(200).json({msg : "password changed"});
                        }).catch(err => console.log(err));
                    }
                } else {
                    
                    return res.json({ msg: "Invalid password" });
                }
            });
        };

    } catch {
        console.log("Failed to reset password");
    }
});


module.exports = userRoutes;