const express = require('express');
const bodyParser = require('body-parser');
const imageValidationRoutes = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');
const utils = require('../utils');
const { exec } = require("child_process");

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
    Endpoint: /imageValidation/loggedin
    checks to see if the uploaded image is a valid image containing a toe.
    It checks the most recent image in the images arrays because the uploaded image first gets added to the images array in the DB.
    returns as the reponse: the output from running the python script. "toe" or "NotToe".
*/
imageValidationRoutes.route('/loggedin').get(async (req, res) => {
    try {
        
        //validate the user
        const token = req.headers.authorization;
        let userId = utils.validateUser(token, res);

        console.log("Checking the image");

        //getting the user's last image
        let user = await utils.findPeople(userId, res);
        let imageName = user.images[user.images.length - 1];
        console.log("userID: ", userId);
        console.log("imagename: ", imageName);

        let commandCheckImage = `cd ./AI/imagecheck && python predictToeOrNot.py ../../images/${userId}/${imageName}`;
        let output = await utils.runCommand(commandCheckImage);
        res.send(output);

    } catch (e) {
        console.log("error validating the image");
        console.log(e);
    }
})

/*
    Endpoint: /imageValidation/notloggedin
    checks to see if the uploaded image is a valid image containing a toe.
    returns as the reponse: the output from running the python script. "toe" or "NotToe".
*/
imageValidationRoutes.route('/notloggedin').post(async (req, res) => {
    let imageName = req.body.myimg;
    try {
        console.log("imagename: ", imageName);

        let commandCheckImage = `cd ./AI/imagecheck && python predictToeOrNot.py ../../tempImages/${imageName}`;
        let output = await utils.runCommand(commandCheckImage);
        res.send(output);
    } catch (e) {
        console.log("error validating the image");
        console.log(e);
    }

})
module.exports = imageValidationRoutes;