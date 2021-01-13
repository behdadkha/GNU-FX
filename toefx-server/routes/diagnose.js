const express = require('express');
const bodyParser = require('body-parser');
const diagnoseRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');
const utils = require('../utils');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
    Endpoint: /diagnose/loggedin
    Analyzes the uploaded image to see if the toe nail is healthy or not. 
    This endpoint is designed to be used by the loggedin users and the output will be saved in the user's profile.
    returns as the reponse: "healthy" or "unhealthy".
*/
diagnoseRouter.route('/loggedin').get(async (req, res) => {
    try {
        //validate the user
        const token = req.headers.authorization;
        let userId = utils.validateUser(token, res);

        let user = await utils.findPeople(userId, res);
        let imageName = user.images[user.images.length - 1];

        console.log("analyzing: " + imageName);
        let commandCheckImage = `cd ./AI/diagnose && python predict.py ../../images/${userId}/${imageName}`;

        let output = await utils.runCommand(commandCheckImage);
        res.send(output.split(" ")[0]);

    }
    catch (e) {
        console.log(e);
    }
});
/*
    Endpoint: /diagnose/notloggedin
    Analyzes the uploaded image to see if the toe nail is healthy or not. 
    Since the user is not logged in, we need to temporarily store the image until the diagnosis is done. 
    returns as the reponse: "healthy" or "unhealthy".
*/
//TODO: After completing the fungus detection part, the temp image should be deleted from the tempImages folder. 
//HINT: Add '&& cd ../../tempImages && del /f ${imageName}' to the end of the commandCheckImage
diagnoseRouter.route('/notloggedin').get(async (req, res) => {
    let imageName = req.query.imageName;
    console.log("analyzing: " + imageName);
    let commandCheckImage = `cd ./AI/diagnose && python predict.py ../../tempImages/${imageName}`;
    let output = await utils.runCommand(commandCheckImage);
    res.send(output.split(" ")[0]);
})


module.exports = diagnoseRouter;