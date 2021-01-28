/*
    Functions for diagnosing images as healthy or infected toenails.
*/

const express = require('express');
const diagnoseRouter = express.Router();
const utils = require('../utils');

//TODO: After completing the fungus detection part, the temp image should be deleted from the tempImages folder. (for /notloggedin)
//HINT: Add '&& cd ../../tempImages && del /f ${imageName}' to the end of the commandCheckImage


/*
    Prints an error message upon a failed image diagnosis.
    param error: The error to be printed.
*/
function PrintImageDiagnosisError(error) {
    console.log("Error diagnosing the image:");
    console.log(error);
}

/*
    Runs the validation on the image.
    commandCheckImage: The command for running the image diagnosis.
    param res: The object to store and send the result in.
*/
async function GetAndSendDiagnosisOutput(commandCheckImage, res)
{
    let output = await utils.runCommand(commandCheckImage);
    return res.send(output.split(" ")[0]);
}

/*
    Endpoint: /diagnose/loggedin
    Analyzes the uploaded image to see if the toenail is healthy or not. 
    This endpoint is designed to be used by the logged in users, and the output will be saved in the user's profile.
    param req: An object with data about the current user. Stored in req.headers.authorization.
    param res: The object to store and send the result in.
    returns: The response "healthy" or "unhealthy".
*/
diagnoseRouter.route('/loggedin').get(async (req, res) => {
    try {
        //Load the user
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        //Analyze the image
        let imageName = user.images[user.images.length - 1];
        if (Object.entries(imageName).length === 0){return res.status(400).json({msg: "No image found in the database"})}
        console.log("Analyzing: " + imageName);

        let commandCheckImage = `cd ./AI/diagnose && python predict.py ../../images/${userId}/${imageName}`;

        //Get and send the output
        await GetAndSendDiagnosisOutput(commandCheckImage, res);
    }
    catch (e) {
        PrintImageDiagnosisError(e);
        return res.status(400).json({msg: "Failed! Token or user not valid"})
    }
});

/*
    Endpoint: /diagnose/notloggedin
    Analyzes the uploaded image to see if the toenail is healthy or not. 
    Since the user is not logged in, the image needs to be stored temporarily until the diagnosis is done.
    param req: An object with data about the image to be diagnosed. Stored in req.query.imageName.
    param res: The object to store and send the result in.
    returns: "healthy" or "unhealthy".
*/
diagnoseRouter.route('/notloggedin').get(async (req, res) => {
    //Analyze the image (no user validation is necessary since the user is not logged in)
    let imageName = req.query.imageName;
    if(imageName === undefined){return res.status(400).json({msg: "Image name not specified"})}
    let commandCheckImage = `cd ./AI/diagnose && python predict.py ../../tempImages/${imageName}`;
    console.log("Analyzing: " + imageName);

    try {
        await GetAndSendDiagnosisOutput(commandCheckImage, res); //Try getting and send the output
    }
    catch (e) {
        PrintImageDiagnosisError(e);
    }
});

module.exports = diagnoseRouter;
