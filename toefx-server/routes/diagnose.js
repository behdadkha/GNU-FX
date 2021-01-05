const express = require('express');
const bodyParser = require('body-parser');
const diagnoseRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const server = require('../server.js');

diagnoseRouter.route('/loggedin').get(async(req, res) => {
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

diagnoseRouter.route('/notloggedin').get((req, res) => {

})


module.exports = diagnoseRouter;