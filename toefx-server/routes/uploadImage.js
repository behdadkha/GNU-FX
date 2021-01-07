const express = require('express');
const bodyParser = require('body-parser');
const uploadImage = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');
let toeData = require('../database/toe-dataSchema');

var fs = require('fs');

uploadImage.route('/loggedin').post(async (req, res) => {
    const image = req.files.file;
    const token = req.headers.authorization;
    const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);

    //if the token is invalid
    if (data == undefined) {
        res.status(500).send({ msg: "Error occured" });
    }

    const userId = data.id;
    let user = await server.findPeople(userId, res);

    console.log(userId);

    let partsOfImageName = image.name.split(".");
    let extension = partsOfImageName[partsOfImageName.length - 1];

    //image name is images.extension
    const imageName = user.images.length + "." + extension;

    //save the new image under user
    user.images.push(imageName);
    user.save();
    ////////////////////////////////////////////////////////////////////////////TODO: FUNGAL COVERAGE FROM AI
    var date = new Date();
    var datetoString = date.toString();
    toeData.findOne({ userID: userId }, (err, item) => {
        if (req.body.foot === "left") {
            item.feet[0].toes[parseInt(req.body.toe)].images.push({
                date: datetoString,
                name: imageName,
                fungalCoverage: '20%'
            })
        }
        else if(req.body.foot === "right") {
            item.feet[1].toes[parseInt(req.body.toe)].images.push({
                date: datetoString,
                name: imageName,
                fungalCoverage: '20%'
            })
        }
        item.save();
    });
    


    try {
        image.mv(`./images/${userId}/${imageName}`, (err) => {
            if (err) {
                console.log("very bad error" + err);
                res.status(500).send({ msg: "Error occured" });
            } else {
                res.send({ msg: "uploaded" })
            }
        });
    }
    catch {
        console.log("Something happened when tried to save the image");
    }
})

uploadImage.route('/notloggedin').post(async (req, res) => {
    const image = req.files.file;
    let partsOfImageName = image.name.split(".");
    let extension = partsOfImageName[partsOfImageName.length - 1];
    var timeInMss = new Date().getTime()
    //image name is the time in milisonds and it is going to be stored in the tempImages folder.
    const imageName = timeInMss + "." + extension;
    try {
        //if user is not loggedin, we dont need to store the images. Create a temp folder and delete it when user uploads a new image
        if (!fs.existsSync('./tempImages')) {
            fs.mkdirSync('./tempImages');
        }
        image.mv(`./tempImages/${imageName}`, (err) => {
            if (err) {
                console.log("error: " + err);
                res.status(500).send({ msg: "Error occured" });
            } else {
                console.log(imageName)
                res.send({ msg: "uploaded", img: imageName })
            }
        });
    }
    catch {
        console.log("Something happened when tried to save the image");
    }
})

module.exports = uploadImage;