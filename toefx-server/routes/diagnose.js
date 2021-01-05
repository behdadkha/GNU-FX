const express = require('express');
const bodyParser = require('body-parser');
const diagnoseRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
//If logged in, makes sure that the token is not modified
diagnoseRouter.route('/loggedin').get(async (req, res) => {
    try {
        //validate the user
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        //if the token is invalid
        if (data == undefined) {
            res.status(500).send({ msg: "Error occured" });
        }
        let user = await server.findPeople(userId, res);
        let imageName = user.images[user.images.length - 1];

        console.log("analyzing: " + imageName);
        const { exec } = require("child_process");
        let commandCheckImage = `cd ./AI/diagnose && python predict.py ../../images/${userId}/${imageName}`;
        exec(commandCheckImage, (err, stdout, stderr) => {
            res.send(stdout.split(" ")[0]);
        });

    }
    catch (e) {
        console.log(e);
    }
});
//TODO: After completing the fungus detection part, the temp image should be deleted from the tempImages folder. 
//HINT: Add '&& cd ../../tempImages && del /f ${imageName}' to the end of the commandCheckImage
diagnoseRouter.route('/notloggedin').get((req, res) => {
    let imageName = req.query.imageName;
    console.log("analyzing: " + imageName);
    const { exec } = require("child_process");
    let commandCheckImage = `cd ./AI/diagnose && python predict.py ../../tempImages/${imageName}`;
    exec(commandCheckImage, (err, stdout, stderr) => {
        res.send(stdout.split(" ")[0]);
    });
})


module.exports = diagnoseRouter;