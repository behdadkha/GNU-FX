/*
    Various functions related to getting and setting user data.
*/

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const utils = require('../utils')
const userSchema = require("../database/userSchema");
const toeDataSchema = require('../database/toe-dataSchema');


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

/*
    Endpoint: /user/getUserInfo
    Finds the user in the database and sends their email and age.
    param req: An object with data about the current user. Stored in req.headers.authorization.
    param res: The object to store and send the result in.
    returns: The response being an object with:
        email: The user's email address. 
        age: The user's age in years.
*/
userRoutes.route('/getUserInfo').get(async (req, res) => {
    try {
        //Get the user
        var user = (await utils.loadUserObject(req, res)).user;

        //Return the data
        res.json({ email: user.email, age: user.age });
    }
    catch {
        res.status(400).json({ msg: "Couldnt get user's info at /getUserInfo." });
    }
});

/*
    Endpoint: /user/getschedule
    Finds the user in the database and sends their schedule.
    param req: An object with data about the current user. Stored in req.headers.authorization.
    param res: The object to store and send the result in.
    returns: The response being the user's schedule.
*/
userRoutes.route('/getschedule').get(async (req, res) => {
    try {
        //Get the user
        var user = (await utils.loadUserObject(req, res)).user;

        //Return the data
        res.json(user.schedule);
    }
    catch (e) {
        res.status(400).json({ msg: "An error occurred while attempting to retrieve a user's schedule. Possibly due to an invalid user." })
    }
});

/*
    Endpoint: /user/resetPassword
    Changes the user's password to a new password.
    param req: The request object containing:
        currentPassword: The user's currently saved password. 
        newPassword1: The new password to replace the old password.
        newPassword2: The confirmed new password (should be same as newPassword1).
    param res: The object to store and send the result in.
*/
userRoutes.post('/resetPassword', async (req, res) => {
    try {
        const { currentPassword, newPassword1, newPassword2 } = req.body;
        if (currentPassword === "" || newPassword1 === "" || newPassword2 === "") { return res.status(400).json({ msg: "All the inputs have to be filled" }) }

        var user = (await utils.loadUserObject(req, res)).user;
        try {
            if (user) {
                bcrypt.compare(currentPassword, user.password).then(async (valid) => { //Check if the current password is correct
                    if (valid) {
                        if (newPassword1 === newPassword2) { //Password can only be changed if the two new passwords match
                            //Hash the password
                            const rounds = 10; //10 rounds of hashing
                            user.password = await hashPassword(newPassword1, rounds);

                            //Save the new encrypted password for security reasons
                            user.save().then(() => {
                                res.status(200).json({ msg: "password changed" });
                            }).catch(err => console.log(err));
                        }
                        else {
                            return res.status(400).json({ msg: "New passwords don't match" })
                        }
                    }
                    else {
                        return res.status(400).json({ msg: "Invalid password" });
                    }
                });
            }
        }
        catch {
            return res.status(400).json({ msg: "Invalid password" })
        }
    }
    catch {
        return res.status(400).json({ msg: "Something went wrong" })
    }
});

// For testing purposes(not implemented in the react app yet)
// Delets a user from the db.
userRoutes.delete('/delete', async (req, res) => {
    const name = "Validation Test";
    userSchema.findOneAndDelete({ name: name }, (err, user) => {
        if (err) {
            return res.status(400).json({ msg: "Can't delete the user" })
        }
        toeDataSchema.deleteOne({ userID: user._id }, (err) => {
            if (err) {
                return res.status(400).json({ msg: "Can't delete the user" })
            }
        });
        let command = `rm -rf images/${user._id}`
        if (config.hostType.includes("Windows"))
            command = `rmdir /s /q images\\${user._id}`
        utils.runCommand(command);
        return res.status(200).json({msg: `User ${user._id} deleted`})
    });


});

module.exports = userRoutes;
