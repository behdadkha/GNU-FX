const express = require('express');
const bodyParser = require('body-parser');
const imageValidationRoutes = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');
const { exec } = require("child_process");

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
imageValidationRoutes.route('/loggedin').get(async (req, res) => {

    try {
        
        //validate the user
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        //if the token is invalid
        if (data == undefined) {
            res.status(500).send({ msg: "Error occured" });
        }

        console.log("Checking the image");

        //getting the user's last image
        let user = await server.findPeople(userId, res);
        let imageName = user.images[user.images.length - 1];
        console.log("userID: ", userId);
        console.log("imagename: ", imageName);

        let commandCheckImage = `cd ./AI/imagecheck && python predictToeOrNot.py ../../images/${userId}/${imageName}`;
        exec(commandCheckImage, (err, stdout, stderr) => {
            //if(stderr) console.log(err);
            console.log(stdout)
            res.send(stdout);
        });
    } catch (e) {
        console.log("error validating the image");
        console.log(e);
    }
})
imageValidationRoutes.route('/notloggedin').post(async (req, res) => {
    console.log("im in imagevalidation");
    let imageName = req.body.myimg;
    try {
        console.log("imagename: ", imageName);

        let commandCheckImage = `cd ./AI/imagecheck && python predictToeOrNot.py ../../tempImages/${imageName}`;
        exec(commandCheckImage, (err, stdout, stderr) => {
            //if(stderr) console.log(stderr);
            res.send(stdout);
        });
    } catch (e) {
        console.log("error validating the image");
        console.log(e);
    }

})
module.exports = imageValidationRoutes;