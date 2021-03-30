/*
    Routes related to getting and setting user data.
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
        res.json({email: user.email, age: user.age});
    }
    catch {
        res.status(400).json({msg: "Couldnt get user's info at /getUserInfo."});
    }
});

/*
    Endpoint: /user/resetPassword
    Changes the user's password to a new password.
    param req: The request object containing:
        currentPassword: The user's currently saved password. 
        newPassword: The new password to replace the old password.
    param res: The object to store and send the result in.
        errorMsg: The type of error message that should be displayed if any.
*/
userRoutes.post('/resetPassword', async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;
        var user = (await utils.loadUserObject(req, res)).user;

        if (user) {
            bcrypt.compare(currentPassword, user.password).then(async (valid) => { //Check if the current password is correct
                if (valid) {
                    //Hash the password
                    const rounds = 10; //10 rounds of hashing
                    user.password = await utils.hashPassword(newPassword, rounds);

                    //Save the new encrypted password for security reasons
                    user.save().then(() => {
                        res.status(200).json({errorMsg: ""}); //No error message means success
                    }).catch(err => console.log(err));
                }
                else {
                    return res.json({errorMsg: "INVALID_CURRENT_PASSWORD" });
                }
            });
        }
    }
    catch {
        return res.status(400).json({errorMsg: "UNKNOWN_ERROR"});
    }
});

/*
    Endpoint: user/saveRotation
    used for replacing the old image with a new rotated image, from the myAccount page
    param file: the new image
    body param imageName: name of the image to be replaced
*/
userRoutes.post('/saveRotation', async (req, res) => {
    if (req.files.file === undefined || req.body.imageName === undefined)
        return res.status(400).json({ msg: "Oops, can't read the image" });

    var user = (await utils.loadUserObject(req, res)).user;
    var imageName = req.body.imageName;

    //Replace the old image with the new rotated one
    utils.moveImageToUserImages(req.files.file, user.id, imageName, res).then(() => {
        return res.send({ msg: "saved" })
    }).catch(() => res.status(500).send({msg: "Error occured"}));
});

/*
    Endpoint: user/delete
    For testing purposes(not implemented in the react app yet)
    Deletes a user from the db.
*/
userRoutes.delete('/delete', async (req, res) => {
    const name = "Validation Test";
    userSchema.findOneAndDelete({name: name}, (err, user) => {
        if (err) {
            return res.status(400).json({ msg: "Can't delete the user" })
        }
        toeDataSchema.deleteOne({userID: user._id}, (err) => {
            if (err) {
                return res.status(400).json({msg: "Can't delete the user"})
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
