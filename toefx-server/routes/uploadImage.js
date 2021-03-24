const express = require('express');
const path = require('path');
const uploadImage = express.Router();
const utils = require('../utils');
let toeData = require('../database/toe-dataSchema');
var fs = require('fs');
const { resolve } = require('path');
const config = require('../config');
var cors = require('cors');
uploadImage.use(cors())

//TODO: Saving new image as last in array could cause bugs and overwrite old images after deletion.


/*
    Saves the toe data in the Database.
    param userId: The user's id in the database (whom the toe data is for).
    param date: The date to be submitted as the image's date.
    param footIndex: 0 or 1 referring to left and right foot respectively.
    param toeIndex: 0 to 4 referring to the toes.["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"]
    param imageName: The name of the image to be saved in DB. Must be the saved as the image's actual name.
*/
function SaveToeData(userId, date, footIndex, toeIndex, imageName, fungalCoverage, res = undefined) {
    return new Promise((resolve, reject) => {
        try {
            //Find the user's images in the database and add to them
            //User slot is automatically created on sign-up
            toeData.findOne({ userID: userId }, async (err, item) => {
                if (item) {
                    //var imagePath = path.resolve(`images/${userId}/${imageName}`)
                    //var pythonFile = path.resolve('AI/actual/Interface.py');
                    //let fungalCoverage = await utils.runCommand(`python ${pythonFile} COVERAGE ${imagePath}`);
                    //fungalCoverage = JSON.parse(fungalCoverage).data[0]

                    item.feet[footIndex].toes[toeIndex].images.push({
                        date: date,
                        name: imageName,
                        fungalCoverage: fungalCoverage
                    })

                    item.save();
                    resolve();
                }
                else {
                    if (res !== undefined) {
                        return res.status(400).json({ msg: "Oops! user does not exist in the toe database" })
                    }
                }
            });
        }
        catch {
            return res.status(400).json({ msg: "Something went wrong, couldnt save the toe data" })
        }
    });


}





/*
    Creates folder /tempImages and stores the uploaded image.
    This is only used for user's who are not logged in.
    Param image: the image file.
    Param ImageName: the name of the image to move.
    returns A promise. Resolved if image is successfully saved.
*/
function moveImageToTempFolder(image, imageName) {
    return new Promise((resolve, reject) => {
        try {
            //Create a temp folder if it doesnt already exist
            if (!fs.existsSync('./tempImages'))
                fs.mkdirSync('./tempImages');

            image.mv(`./tempImages/${imageName}`, (err) => { //The move image command
                if (err) {
                    utils.PrintImageMovementError(error);
                    reject();
                }
                else {
                    resolve();
                }
            });
        }
        catch (e) {
            utils.PrintImageMovementError(e);
        }
    });
}

/*
    Parses an image extension from an image name.
    param image: The image whose name is to be parsed.
    returns: The image extension (.png, .jpg, etc.).
*/
function GetImageExtension(image) {
    var partsOfImageName = image.name.split(".");
    var extension = (partsOfImageName.length > 1) ? partsOfImageName[partsOfImageName.length - 1] : "jpg";
    return extension;
}

/*
    Endpoint: /upload/decompose
    Using AI/actual/Interface.py, it extracts the toe nails from the uploaded image and saves it in images/"userid"
    returns as the response: the name of the created images
*/
uploadImage.route('/decompose').get(async (req, res) => {
    var userObject = await utils.loadUserObject(req, res);
    var user = userObject.user;
    var userId = userObject.id;

    let imageName = user.images[user.images.length - 1];

    var filePath = path.resolve(`images/${userId}/${imageName}`)
    var pythonFile = path.resolve('AI/actual/Interface.py');
    let decomposedNails = await utils.runCommand(`python ${pythonFile} DECOMPOSE ${filePath}`);
    
    decomposedNails = JSON.parse(decomposedNails.split("\n")[1]).data; // need to get rid of the first line "loading nail recognition model..."
    //image name: decomposedNails[i][0]
    //images cordinates in the original image: decomposedNails[i][1]
    //the color of the box in the original image: decomposedNails[i][2]
    //eg. the index toe is takes from x:20, y:30 of the original image
    //eg. the index teo has a red box in the original image to make it easier for user to identify the toe

    //adding the new created image that has boxes around toes to the user's images
    let newCLRImageName = imageName.split(".")[0] + "_CLR.png";
    user.images.push(newCLRImageName)
    
    let decomposedImages = [];
    for (let i = 0; i < decomposedNails.length; i++) {
        let imagePath = path.resolve(`images/${userId}/${decomposedNails[i][0]}`)
        let fungalCoverage = await utils.runCommand(`python ${pythonFile} COVERAGE ${imagePath}`);
        fungalCoverage = JSON.parse(fungalCoverage).data[0] + "%";

        decomposedImages.push( {name: path.basename(decomposedNails[i][0]), cord: decomposedNails[i][1], color: decomposedNails[i][2], fungalCoverage: fungalCoverage } );
        //Save the new images under user in the database
        user.images.push(path.basename(decomposedNails[i][0]));
    }
    

    //need to sort from left to right
    decomposedImages.sort((a,b) => a.cord[0] - b.cord[0])
    console.log(decomposedImages);
    user.save();
    res.json({ imagesInfo: decomposedImages, CLRImage: newCLRImageName });

});

/*
    Endpoint: /upload/save
    body param imageName: the name of the image to be saved
               foot: The foot index the image is for, 0 or 1.
               toe: The toe index the image is for, 0 to 4
*/
uploadImage.route('/save').post(async (req, res) => {

    var userObject = await utils.loadUserObject(req, res);
    var user = userObject.user;
    var userId = userObject.id;

    //Prep the data to be saved in the toe-data collection 
    var date = new Date(); //Use the current date as the image's date
    if (req.body.foot === undefined || req.body.toe === undefined) { return res.status(400).json({ msg: "Foot or toe is undefined" }) }
    var datetoString = date.toString();
    var footIndex = parseInt(req.body.foot)
    var toeIndex = parseInt(req.body.toe);
    var imageName = req.body.imageName;
    var fungalCoverage = req.body.fungalCoverage;

    //Save the data in the database
    SaveToeData(userId, datetoString, footIndex, toeIndex, imageName, fungalCoverage, res).then(() => {
        res.json({ msg: "successful" });
    });

    
});

/*
    note: this is different from myAccount/delete
    it deletes the decomposed images that user did not keep
    body param images: the name of the images to delete
*/

uploadImage.route('/deleteImage').delete(async (req, res) => {

    try {
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        
        console.log(req.query.images);
        let imageNames = req.query.images.split(",");
        if( imageNames.length <= 0) 
            return res.status(400).json({ msg: "could not delete the images" });

        for (let i = 0; i < imageNames.length; i++) {
            let imageName = imageNames[i];
            //deleting the toe image from the user collection
            user.images.splice(user.images.findIndex(name => name == imageName), 1);

            //deleting the toe image from the user images folder
            let command = `rm images/${userId}/${imageName}`
            if (config.hostType.includes("Windows"))
                command = `del images\\${userId}\\${imageName}`
            utils.runCommand(command);

        }
        user.save();
        res.json({ msg: "successful" });

    }
    catch {
        res.status(400).json({ msg: "could not delete the images" });
    }

});

/*
    Endpoint: /upload/loggedin
    Saves the uploaded toe image in the database and moves the image to the user's folder in /images.
    param req: The request object containing:
        files.file: The image to upload.
        body.foot: The foot index the image is for, 0 or 1.
        body.toe: The toe index the image is for, 0 to 4.
    param res: The object to store and send the result in.
    returns: The reponse being an object {msg: uploaded} for success.
*/
uploadImage.route('/loggedin').post(async (req, res) => {

    try {
        if (req.files.file === undefined) { return res.status(400).json({ msg: "Oops, can't read the image" }) }

        const image = req.files.file;
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        var extension = GetImageExtension(image); //Used in the image name later

        //user.imageIndex is used to prevent image overwrite after deletion
        if (user.imageIndex === undefined) user.imageIndex = user.images.length
        const imageName = user.imageIndex + "." + extension;

        //Save the new image under user
        user.images.push(imageName);
        user.imageIndex += 1;
        user.save()

        //Move it to the database
        utils.moveImageToUserImages(image, userId, imageName, res).then(() => {
            return res.send({ msg: "uploaded" })
        }).catch(() => res.status(500).send({ msg: "Error occured" }));
    }
    catch {
        return res.status(400).json({ msg: "Invalid token" });
    }
    


})

/*
    Endpoint: /upload/notloggedin
    Saves the uploaded image to a temp folder when the user is not logged in.
        Eventually it will delete the image after the fungal coverage percentage is calculated (not implemented yet).
    param req: The request object containing:
        files.file: The image to upload.
    param res: The object to store and send the result in.
    returns as the response: msg: "uploaded" and img: the name of the saved image
*/
uploadImage.route('/notloggedin').post(async (req, res) => {

    const image = req.files.file;

    var extension = GetImageExtension(image);
    var timeInMs = new Date().getTime()

    //Image name is the time in milisonds and it is going to be stored in the tempImages folder.
    const imageName = timeInMs + "." + extension;

    //Move it to a temp folder for later
    moveImageToTempFolder(image, imageName).then(() => {
        res.send({ msg: "uploaded", img: imageName })
    }).catch(() => res.status(500).send({ msg: "Error occured" }));

})

module.exports = uploadImage;


