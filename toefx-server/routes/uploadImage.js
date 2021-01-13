const express = require('express');
const bodyParser = require('body-parser');
const uploadImage = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');
const utils = require('../utils');
let toeData = require('../database/toe-dataSchema');

var fs = require('fs');
const { resolve } = require('path');

/*
    Saves the toe data in the Database.
    param userId: the user's id in the database.(the user who owns the toe data)
    param date: the date to be submitted as the image's date
    param footIndex: 0 or 1 referring to left and right foot respectively 
    param toeIndex: 0 to 4 referring to the toes. ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"]
    param imageName: the name of the image to be saved in DB. must be the save name as the images actual name.
*/
function saveToeData(userId, date, footIndex, toeIndex, imageName ){
    toeData.findOne({ userID: userId }, (err, item) => {
        
        //if this is not the first image to be saved
        if (item){
            item.feet[footIndex].toes[toeIndex].images.push({
                date: date,
                name: imageName,
                fungalCoverage: '20%'
            })
            item.save();
        }
        
    });
}

/*
    Moves the uploaded image to the user's folder in /images
    param image: the image file.
    param userId: user's id. It is also equal to the folder name. /images/$userId
    param imageName: the name of the image to moved.
    returns a promise.
*/
function moveImageToUserImages(image, userId, imageName){
    return new Promise((resolve, reject) => {
        try {
            image.mv(`./images/${userId}/${imageName}`, (err) => {
                if (err) {
                    console.log("error: " + err);
                    reject();
                } else {
                    resolve();
                }
            });
        }
        catch(e) {
            console.log(e);
            console.log("Something happened when tried to save the image");
        }
    });
    
}

/*
    Creates folder /tempImages and stores the uploaded image.
    This is only used for user's who are not logged in.
    Param image: the image file.
    Param ImageName: the name of the image to move.
    returns a promise. Resolved if image successfully saved.
*/
function moveImageToTempFolder(image, imageName){
    return new Promise((resolve, reject) => {
        try {
            //create temp folder if doesnt exist
            if (!fs.existsSync('./tempImages')) {
                fs.mkdirSync('./tempImages');
            }
            image.mv(`./tempImages/${imageName}`, (err) => {
                if (err) {
                    console.log("error: " + err);
                    reject();
                } else {
                    console.log(imageName)
                    resolve();
                }
            });
        }
        catch {
            console.log("Something happened when tried to save the image");
        }
    });
    
}

/*
    Endpoint: /uploadImage/loggedin
    saves the toedata in the database and moves the image to the user's folder in /images
    Files Param file: the image
    Body param foot: the foot index,0 or 1
    Body param toe: the toe index, 0 to 4
    returns as the response: msg: uploaded
    note: it uses the current date as the image's date 
*/
uploadImage.route('/loggedin').post(async (req, res) => {
    const image = req.files.file;
    const token = req.headers.authorization;
    let userId = utils.validateUser(token, res);

    let user = await utils.findPeople(userId, res);

    console.log(userId);

    let partsOfImageName = image.name.split(".");
    let extension = partsOfImageName[partsOfImageName.length - 1];

    //image name is images.extension
    const imageName = user.images.length + "." + extension;

    //save the new image under user
    user.images.push(imageName);
    user.save()
    
    //saving the data in the toe-data collection 
    var date = new Date();
    var datetoString = date.toString();
    var footIndex = parseInt(req.body.foot)
    var toeIndex = parseInt(req.body.toe);
    
    //saving toeData
    saveToeData(userId, datetoString, footIndex, toeIndex, imageName)

    moveImageToUserImages(image, userId, imageName).then(() => {
        res.send({ msg: "uploaded" })
    })
    .catch(() => res.status(500).send({ msg: "Error occured" }));

})

/*
   Endpoint: /uploadImage/notloggedin
   Used by not loggedin user.
   It creates a temp folder and saves it the uploaded image.
   Eventually it should delte the image after the fungal coverage percentage is calculated(not implemented yet) 
   Files param file: the image.
   returns as the response: msg: "uploaded" and img: the name of the saved image
*/
uploadImage.route('/notloggedin').post(async (req, res) => {
    const image = req.files.file;
    let partsOfImageName = image.name.split(".");
    let extension = partsOfImageName[partsOfImageName.length - 1];
    var timeInMss = new Date().getTime()

    //image name is the time in milisonds and it is going to be stored in the tempImages folder.
    const imageName = timeInMss + "." + extension;
    moveImageToTempFolder(image, imageName).then(() => {
        res.send({ msg: "uploaded", img: imageName })
    })
    .catch(() => res.status(500).send({ msg: "Error occured" }));
})

module.exports = uploadImage;