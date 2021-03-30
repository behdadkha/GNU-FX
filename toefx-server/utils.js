/*
    Various utility functions for the server.
*/

const jwt = require('jsonwebtoken');
const {exec} = require('child_process');
const userSchema = require('./database/userSchema');
const toeDataSchema = require('./database/toe-dataSchema');
const config = require('./config');
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');

/*
    Finds a user object in the database based on a userId.
    param userId: The user to search for.
    param res: The object to store and send the result in.
    returns: A promise. Resolves with the user object if found.
*/
function getUserByUserId(userId, res) {
    return new Promise((resolve, reject) => {
        userSchema.findOne({ _id: userId }).then(user => {
            if (user) {
                resolve(user);
            }
            else { //The email address wasn't found
                res.status(400).json(undefined);
                reject();
            }
        })
    })
}

/*
    Loads a userId from a given token.
    param jwtToken: A jwtToken containing data to extract the userId from.
    param res: The resulting object to store data in.
    returns: The userId extracted from the token.
*/
function getUserIdFromToken(jwtToken, res) {
    const data = jwt.verify(jwtToken.replace("Bearer ", ""), config.secretKey);

    if (data == undefined)
        res.status(500).send({msg: "Error occured"});

    return data.id;
}

/*
    Loads a user object from a given user Id request.
    param req: The request to pull data from.
    param res: The resulting object to store data in.
    returns: An object containing the requested user's data.
*/
async function loadUserObject(req, res) {
    const token = req.headers.authorization;
    var userId = getUserIdFromToken(token, res);
    var user = await getUserByUserId(userId, res); //The user object
    
    return {
        user: user,
        id: userId,
    }
}

/*
    Finds a user's toe data in the database.
    param userId: The user to search for.
    returns: A promise. Resolves with the data object if found.
*/
function getToeData(userId) {
    return new Promise((resolve, reject) => {
        toeDataSchema.findOne({userID: userId}).then(data => {
            if(data)
                resolve(data);
            else
                reject("Data not found");
        });
    });
}

/*
    Hashes the given password.
    Param password: The text that needs to be hashed.
    Param hashRounds: The number of rounds the hash function should run.
    returns: A promise with the hash if resolved.
*/
function hashPassword(password, hashRounds) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(hashRounds, (error, salt) => {
            bcrypt.hash(password, salt, (error, hash) => {
                if (error)
                    throw error;

                //Return the hashed password
                resolve(hash);
            });
        });
    });
}

/*
    Hashes an email into a URL.
    param email: The email to hash.
    param route: The route the hashing is for (likely emailverification or forgotpassword).
    returns: The hashed link as a promise.
*/
function hashedURL(email, route) {
    return new Promise((Resolve, Reject) => {
        const rounds = 10; //10 rounds of hashing

        bcrypt.genSalt(rounds, (err, salt) => {
            bcrypt.hash(email, salt, (err, hash) => {
                //e.g url: http://localhost:3000/emailverification/hashedemailaddress
                Resolve(`${config.dev_client}/${route}/${hash}`);
            });
        });
    });
}

/*
    Runs some server command.
    param command: The command to run on the server.
    returns: A promise with the command line output. Resolved if the command is run successfully.
*/
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                reject("Can't run this command");
            }
            else {
                resolve(stdout);
            }
        });
    });
}
/*
    Sends an email
    param email: To: email
    param subject: email subject
    param body: email content
*/
function sendEmail(email, subject, body){
    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: config.dev_email,
            pass: config.dev_epass
        }
    });

    var mailOption = {
        from: config.dev_email,
        to: email,
        subject: subject,
        text: body
    }
    
    //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //Needed for testing
    smtpTransport.sendMail(mailOption, (err, resp) => {
        if (err) {
            console.log(err);
        }
    })
}

//An empty data structure used when a new user is created
var emptyFeet = [
    {
        toes: [
            {images: []},
            {images: []},
            {images: []},
            {images: []},
            {images: []}
        ]
    },
    {
        toes: [
            {images: []},
            {images: []},
            {images: []},
            {images: []},
            {images: []}
        ]
    }
];


/*
    Moves the uploaded image to the user's folder in /images
    param image: The image file.
    param userId: The user's id. Also same as the folder name (/images/$userId).
    param imageName: The name of the image to moved.
    returns A promise. Resolved if image is successfully saved.
*/
function moveImageToUserImages(image, userId, imageName) {
    return new Promise((resolve, reject) => {
        try {
            image.mv(`./images/${userId}/${imageName}`, (err) => { //The move image command
                if (err) {
                    PrintImageMovementError(err);
                    reject();
                }
                else {
                    resolve();
                }
            });
        }
        catch (e) {
            PrintImageMovementError(e);
        }
    });
}

/*
    Prints an error message upon a failed image move.
    param error: The error to be printed.
*/
function PrintImageMovementError(error) {
    console.log("Error while attempting to move the image:");
    console.log(error);
}

//Function Exports
module.exports.loadUserObject = loadUserObject;
module.exports.runCommand = runCommand;
module.exports.getToeData = getToeData;
module.exports.hashPassword = hashPassword;
module.exports.hashedURL = hashedURL;
module.exports.emptyFeet = emptyFeet;
module.exports.sendEmail = sendEmail;
module.exports.moveImageToUserImages = moveImageToUserImages;
