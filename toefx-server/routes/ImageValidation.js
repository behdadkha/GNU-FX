/*
    Functions for validating whether or not an image is of a toe.
*/

const express = require('express');
const imageValidationRoutes = express.Router();
const utils = require('../utils');

//TODO: The user's last image shouldn't be checked, since the saving should only happen once the image is validated.


/*
    Prints an error message upon a failed image validation.
    param error: The error to be printed.
*/
function PrintImageValidationError(error) {
    console.log("Error validating the image:");
    console.log(error);
}

/*
    Runs the diagnosis on the image.
    commandCheckImage: The command for running the image validation.
    param res: The object to store and send the result in.
*/
async function GetAndSendValidationOutput(commandCheckImage, res)
{
    let output = await utils.runCommand(commandCheckImage);
    res.send(output);
}

/*
    Endpoint: /imageValidation/loggedin
    Checks to see if the uploaded image is a valid image containing a toe.
        It checks the most recent image in the images arrays because the uploaded image
        first gets added to the images array in the database.
    param req: An object with data about the current user. Stored in req.headers.authorization.
    param res: The object to store and send the result in.
    returns: The respone being the output from running the python script. "toe" or "NotToe".
*/
imageValidationRoutes.route('/loggedin').get(async (req, res) => {
    try {
        //Load the user
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;

        //Get the image to be validaed
        let imageName = user.images[user.images.length - 1]; //The user's last uploaded image
        if (Object.entries(imageName).length === 0){return res.status(400).json({msg: "No image found in the database"})}
        let commandCheckImage = `cd ./AI/imagecheck && python predictToeOrNot.py ../../images/${userId}/${imageName}`;
        console.log("Validating the image: " + imageName + " userID: " + userId);
        console.log("userID: ", userId);
        console.log("imageName: ", imageName);

        //Get and send the output
        GetAndSendValidationOutput(commandCheckImage, res);
    }
    catch (e) {
        PrintImageValidationError(e);
        return res.status(400).json({msg: "Failed! Token or user not valid"})
    }
});

/*
    Endpoint: /imageValidation/notloggedin
    checks to see if the uploaded image is a valid image containing a toe.
    param req: An object with data about the image to be checked. Stored in req.body.myimg.
    param res: The object to store and send the result in.
    returns: The respone being the output from running the python script. "toe" or "NotToe".
*/
imageValidationRoutes.route('/notloggedin').post(async (req, res) => {
    let imageName = req.body.myimg;
    if(imageName === undefined){return res.status(400).json({msg: "Image name not specified"})};
    let commandCheckImage = `cd ./AI/imagecheck && python predictToeOrNot.py ../../tempImages/${imageName}`;
    console.log("Validating: ", imageName);

    try {
        GetAndSendValidationOutput(commandCheckImage, res);
    }
    catch (e) {
        PrintImageValidationError(e);
    }
});

module.exports = imageValidationRoutes;
