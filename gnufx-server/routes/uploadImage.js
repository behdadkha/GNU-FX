/*
    Routes for facilitating image uploads by the user.
*/

const express = require('express');
const path = require('path');
const { StatusCode } = require('status-code-enum');
const uploadImage = express.Router();
const utils = require('../utils');
let toeData = require('../database/toe-dataSchema');
var fs = require('fs');
const { resolve } = require('path');
const config = require('../config');
var cors = require('cors');
uploadImage.use(cors())


/*
    Saves the toe data in the Database.
    param userId: The user's id in the database (whom the toe data is for).
    param date: The date to be submitted as the image's date.
    param footIndex: 0 or 1 referring to left and right foot respectively.
    param toeIndex: 0 to 4 referring to the toes.["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"]
    param imageName: The name of the image to be saved in DB. Must be the saved as the image's actual name.
*/
function SaveToeData(userId, date, footIndex, toeIndex, imageName, fongiqueCoverage, res=undefined) {
    return new Promise((resolve, reject) => {
        try {
            //Find the user's images in the database and add to them
            //User slot is automatically created on sign-up
            toeData.findOne({ userID: userId }, async (err, item) => {
                if (item) {
                    //var imagePath = path.resolve(`images/${userId}/${imageName}`)
                    //var pythonFile = path.resolve('AI/actual/Interface.py');
                    //let fongiqueCoverage = await utils.runCommand(`python ${pythonFile} COVERAGE ${imagePath}`);
                    //fongiqueCoverage = JSON.parse(fongiqueCoverage).data[0]
                    item.feet[footIndex].toes[toeIndex].images.push({
                        date: date,
                        name: imageName,
                        fongiqueCoverage: fongiqueCoverage
                    })

                    item.save();
                    resolve();
                }
                else {
                    if (res !== undefined) {
                        return res.status(StatusCode.ClientErrorBadRequest).json({ msg: "Oops! user does not exist in the toe database" })
                    }
                }
            });
        }
        catch {
            return res.status(StatusCode.ClientErrorBadRequest).json({ msg: "Something went wrong, couldnt save the toe data" })
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
    Extends the heroku request timeout (fix for h12)
*/
const extendTimeoutMiddleware = (req, res, next) => {
    const space = ' ';
    let isFinished = false;
    let isDataSent = false;
  
    // Only extend the timeout for API requests
    if (!req.url.includes('/decompose')) {
      next();
      return;
    }
  
    res.once('finish', () => {
      isFinished = true;
    });
  
    res.once('end', () => {
      isFinished = true;
    });
  
    res.once('close', () => {
      isFinished = true;
    });
  
    res.on('data', (data) => {
      // Look for something other than our blank space to indicate that real
      // data is now being sent back to the client.
      if (data !== space) {
        isDataSent = true;
      }
    });
  
    const waitAndSend = () => {
      setTimeout(() => {
        // If the response hasn't finished and hasn't sent any data back....
        if (!isFinished && !isDataSent) {
          // Need to write the status code/headers if they haven't been sent yet.
          if (!res.headersSent) {
            res.writeHead(202);
          }
          res.write(space);
  
          // Wait another 15 seconds
          waitAndSend();
        }
      }, 15000);
    };
  
    waitAndSend();
    next();
};

uploadImage.use(extendTimeoutMiddleware)

/*
    Endpoint: /upload/decompose
    Using AI/actual/Interface.py, it extracts the toe nails from the uploaded image and saves it in images/"userid"
    body param headers.authorization: The user's token.
    returns as the response: the name of the created images
*/
uploadImage.route('/decompose').get(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    try {
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        let imageName = user.images[user.images.length - 1];
        var filePath = path.resolve(`images/${userId}/${imageName}`)
        var pythonFile = path.resolve('AI/actual/Interface.py');

        let decomposedNails = await utils.runCommand(`python ${pythonFile} DECOMPOSE ${filePath}`)
        
        console.log(decomposedNails)
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
            //calculate fongique converage for each image
            let imagePath = path.resolve(`${decomposedNails[i][0]}`)
            let fongiqueCoverage = await utils.runCommand(`python ${pythonFile} COVERAGE ${imagePath}`);
            fongiqueCoverage = JSON.parse(fongiqueCoverage).data[0] + "%";

            decomposedImages.push({ name: path.basename(decomposedNails[i][0]), cord: decomposedNails[i][1], color: decomposedNails[i][2], fongiqueCoverage: fongiqueCoverage });
            //Save the new images under user in the database
            user.images.push(path.basename(decomposedNails[i][0]));
        }

        //need to sort from left to right
        decomposedImages.sort((a, b) => a.cord[0] - b.cord[0])
        console.log(decomposedImages);
        user.save();
        res.end(JSON.stringify({ imagesInfo: decomposedImages, CLRImage: newCLRImageName }));
    }
    catch {
        res.end(JSON.stringify({ imagesInfo: [], CLRImage: "" }));
    }
});

/*
    Endpoint: /upload/save
    Saves an uploaded image with data to the database.
    body param imageName: The name of the image to be saved
               headers.authorization: The user's token.
               foot: The foot index the image is for, 0 or 1.
               toe: The toe index the image is for, 0 to 4
    param res: The object to store and send the result in.
    returns as the response: A status code along with an insignifcant result message.
*/
uploadImage.route('/save').post(async (req, res) => {
    var userObject = await utils.loadUserObject(req, res);
    var userId = userObject.id;

    //Prep the data to be saved in the toe-data collection 
    var date = new Date(); //Use the current date as the image's date
    if (req.body.foot === undefined || req.body.toe === undefined)
        return res.status(StatusCode.ClientErrorBadRequest).json({ msg: "Foot or toe is undefined" });
    
    var datetoString = date.toString();
    var footIndex = parseInt(req.body.foot);
    var toeIndex = parseInt(req.body.toe);
    var imageName = req.body.imageName;
    var fongiqueCoverage = req.body.fongiqueCoverage;

    //Save the data in the database
    SaveToeData(userId, datetoString, footIndex, toeIndex, imageName, fongiqueCoverage, res).then(() => {
        res.json({ msg: "successful" });
    });
});

/*
    Endpoint: /upload/deleteImage
    Deletes decomposed images that user decided not to keep.
        Note: this is different from myAccount/delete
    body param headers.authorization: The user's token.
    body param images: The names of the images to delete.
    param res: The object to store and send the result in.
    returns as the response: A status code along with an insignifcant result message.
*/
uploadImage.route('/deleteImage').delete(async (req, res) => {
    try {
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        console.log(req.query.images);

        let imageNames = req.query.images.split(",");
        if (imageNames.length <= 0) //No images to actually delete
            return res.status(StatusCode.ClientErrorBadRequest).json({msg: "No images to delete or incorrect image format."});

        for (let i = 0; i < imageNames.length; ++i) {
            let imageName = imageNames[i];
            
            //Delete the toe image from the user's collection
            user.images.splice(user.images.findIndex(name => name == imageName), 1);

            //Delete the toe image from the user's images folder
            let command = `rm images/${userId}/${imageName}`
            if (config.hostType.includes("Windows"))
                command = `del images\\${userId}\\${imageName}`

            utils.runCommand(command);
        }

        user.save();
        res.json({msg: "successful"});
    }
    catch {
        res.status(StatusCode.ClientErrorBadRequest).json({msg: "Error deleting the images."});
    }
});

/*
    Endpoint: /upload/loggedin
    Saves the uploaded toe image in the database and moves the image to the user's folder in /images.
    param req: JSON object with the following members:
               files: JSON object with the following member:
                    file: The image to upload.
               body: JSON object with the following member:
                    headers.authorization: The user's token.
                    foot: The foot index the image is for, 0 or 1.
                    toe: The toe index the image is for, 0 to 4.
    returns: In res, the reponse being an object {msg: uploaded} for success.
*/
uploadImage.route('/loggedin').post(async (req, res) => {
    try {
        if (req.files.file === undefined)
            return res.status(StatusCode.ClientErrorBadRequest).json({msg: "Oops, can't read the image"});

        const image = req.files.file;
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        var extension = GetImageExtension(image); //Used in the image name later

        //user.imageIndex is used to prevent image overwrite after deletion
        if (user.imageIndex === undefined)
            user.imageIndex = user.images.length;

        const imageName = user.imageIndex + "." + extension;

        //Save the new image under user
        user.images.push(imageName);
        user.imageIndex += 1;
        user.save()

        //Move it to the database
        utils.moveImageToUserImages(image, userId, imageName, res).then(() => {
            return res.send({msg: "uploaded"})
        }).catch(() => res.status(StatusCode.ServerErrorInternal).send({msg: "Error occured"}));
    }
    catch {
        return res.status(StatusCode.ClientErrorBadRequest).json({msg: "Invalid token"});
    }
})

module.exports = uploadImage;
