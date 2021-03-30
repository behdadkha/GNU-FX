const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { stderr } = require('process');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCode } = require('status-code-enum');
const config = require('./config');
const utils = require('./utils');
const uploadImage = require('./routes/uploadImage');
const userRoutes = require('./routes/user');
const forgotpasswordRoutes = require('./routes/ForgotPassword');

app.use(cors());
app.use(fileUpload());
app.use(express.static('./images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');


/*
    Import database schemas
*/
const userSchema = require("./database/userSchema");
const toe_dataSchema = require("./database/toe-dataSchema");
const verificationLinks = require('./database/verificationLinks');

//Connect to Database
(async () => {
    try {
        await mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});
    }
    catch (e) {
        throw e;
    }
})();

/*
    Creates a folder in folder /images.
    The folder will be user for storing the images.
    Param userId: the folder's name referring the the folder owner.
*/
function CreateImageFolder(userId) {
    return new Promise((resolve, reject) => {
        utils.runCommand(`cd images && mkdir ${userId}`).then(() => {
            resolve();
        })
    });
}

/*
    Creates a new user in the database.
    It hashes the given password and only stores the hashed value.
    Param name: the name given by the user in the signup form.
    Param email: the email address given by the user.
    Param password: the password in text given by the user.
    Param birthday: user's birthday.
*/
function CreateNewUser(name, email, password, birthday) {
    return new Promise((resolve, reject) => {
        //Hash rounds
        const rounds = 10;

        //Hash the password
        bcrypt.genSalt(rounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err)
                    throw err;

                //Create a new user with the hashed password
                const newUser = new userSchema({
                    email: email,
                    name: name,
                    password: hash,
                    images: [],
                    birthday: birthday
                });

                newUser.save().then(() => {
                    console.log(`User "${email}" has been added.`);
                    resolve(newUser);
                }).catch(err => console.log(err));
            });
        });
    });
}

/*
    Creates a new object in the toe-data (database) for a new user.
*/
function CreateEmptyToeEntry(userId) {
    const emptyFeet = utils.emptyFeet;
    const newToeData = new toe_dataSchema({
        userID: userId,
        feet: emptyFeet
    });

    return new Promise((resolve, reject) => {
        newToeData.save().then(() => {
            resolve();
        });
    });
}

/*
    Creates a signed jwt token sent to the user on login.
    returns a promise with the token if resolved.
*/
function CreateSignedToken(payload, key, expiresIn) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, key, {expiresIn: expiresIn},
            (err, token) => {
                resolve(token);
            });
    });
};

/*
    Checks if the sign up form has any field remaining to be filled out.
    A similar check is done on the client side.
    param name: The user's name input.
    param email: The user's email input.
    param password: The user's password input:
    param birthday: The user's birthday input.
    returns: "" if the inputs aren't blank, an error type otherwise.
*/
function CheckSignUpInputForStandardError(name, email, password, birthday) {
    if (name === "" || email === "" || password === "" || birthday === "")
        return "BLANK_INPUT"; //Required input is empty
    else if (name === undefined || email === undefined || password === undefined || birthday === undefined)
        return "UNDEFINED_INPUT"; //Required input is undefined
    else
        return ""; //No error
}

/*
    Checks if a given string can actually be used as an email address.
    A similar check is done on the client side.
    param email: The email address to check.
    returns: true if the email is valid, false otherwise.
*/
function ValidateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/*
    Checks if a given string is actually possible for a user's name.
    A similar check is done on the client side.
    param name: The name to check.
    returns: true if the name is valid, false otherwise.
*/
function IsValidName(name) {
    const re = /^[a-zA-Z]{3,} [a-zA-Z]+$/;
    return re.test(name);
}

/*
    Checks if the user entered a good password that can be saved for them.
    A similar check is done on the client side.
    param password: The password to check.
    returns: true if the user's input password is good, false otherwise.
*/
function IsValidPassword(password) {
    return password.match(/[a-z]+/) && password.match(/[A-Z]+/) //Password has lowercase and uppercase
        && password.match(/[0-9]+/) //Password has number
        && password.length >= 8; //Password has at least 8 characters
}

/*
    Sends a link to the user to verify their account.
    param name: The name of the user.
    param email: The email to send to.
*/
async function SendVerificationEmail(name, email) {
    const urlTobeSent = await utils.hashedURL(email, "emailverification"); //Hash the user's email into a unique URL
    const subject = "Email Verification";
    const body = `${name},\n\nPlease use the link below to verify your email address. If you have not created an account, simply ignore this email.\n\n${urlTobeSent}\n\nThank you,\n\nToeFX Team`;

    //Add the url to the database (verificationLink schema)
    var verification = new verificationLinks({email: email, link: urlTobeSent})
    verification.save();

    //Send email
    utils.sendEmail(email, subject, body);
}

/*
    Endpoint: /login
    Logs in a user if they exist in the database.
    body param email: User's email address.
    body param password: User's password in plain text.
    returns as the response: A jwt token representing the user.
*/
app.post('/login', (req, res) => {
    const {email, password} = req.body;

    if (email === "" || password === "")
        return res.status(StatusCode.ClientErrorBadRequest).json({errorMsg: "BLANK_FIELD"}); //Error code enums were experimented on in this function

    //Search for the provided email in the database
    try {
        userSchema.findOne({email: email}).then(user => {
            if (user) { //A user was found
                bcrypt.compare(password, user.password).then(async (valid) => {
                    if (valid) {
                        if (user.emailverified) {
                            const payload = {
                                id: user.id,
                                name: user.name
                            };

                            var token = await CreateSignedToken(payload, config.secretKey, "1 day");
                            res.status(StatusCode.SuccessAccepted).json({
                                success: true,
                                token: "Bearer " + token
                            });
                        }
                        else {
                            SendVerificationEmail(user.name, email); //Send verification email again
                            return res.status(StatusCode.ClientErrorLocked).json({errorMsg: "UNVERIFIED_ACCOUNT"});
                        }
                    }
                    else {
                        return res.status(StatusCode.ClientErrorUnauthorized).json({errorMsg: "INVALID_CREDENTIALS"});
                    }
                });
            }
            else { //The email address was not found
                res.status(StatusCode.ClientErrorNotFound).json({errorMsg: "INVALID_EMAIL"});
            }
        });
    }
    catch {
        console.log("Login failed");
        res.status(StatusCode.ClientErrorBadRequest).json({errorMsg: "UNKNOWN_ERROR"});
    }
});

/*
    Endpoint: /signup
    Creates a new user and an image folder for the new user. 
    body param name: The name given by the user in the signup form.
    body param email: The email address given by the user.
    body param password: The password in plain text given by the user.
    body param birthday: The user's birthday.
    returns as the response: A SuccessOK code if successful. An error code otherwise.
                             Also returns in param errorMsg an error message type if necessary.
*/
app.post('/signup', (req, res) => {
    const {name, email, password, birthday} = req.body;
    const inputValidMsg = CheckSignUpInputForStandardError(name, email, password, birthday);

    if (inputValidMsg !== "")
        return res.status(StatusCode.ClientErrorBadRequest).json({errorMsg: "BLANK_FIELD"});

    if (!ValidateEmail(email))
        return res.status(StatusCode.ClientErrorBadRequest).json({errorMsg: "INVALID_EMAIL"});

    if (!IsValidPassword(password))
        return res.status(StatusCode.ClientErrorBadRequest).json({errorMsg: "INVALID_PASSWORD"});

    if (!IsValidName(name))
        return res.status(StatusCode.ClientErrorBadRequest).json({errorMsg: "INVALID_NAME"});

    try {
        //Search database to see if user already exists
        userSchema.findOne({email: email}).then(async (user) => {
            if (user) { //The email address already exists
                return res.status(StatusCode.ClientErrorConflict).json({errorMsg: "ACCOUNT_EXISTS"});
            }
            else { //This email is free
                try {
                    //Create a new user
                    const user = await CreateNewUser(name, email, password, birthday);

                    //Create a new image folder for the user
                    CreateImageFolder(user.id).then(() => {
                        CreateEmptyToeEntry(user.id).then(() => {
                            res.status(StatusCode.SuccessOK).json({});
                        });
                    });

                    SendVerificationEmail(name, email);
                }
                catch {
                    res.status(StatusCode.ServerErrorInternal).json({errorMsg: "UNKNOWN_ERROR"});
                }
            }
        });
    }
    catch {
        return res.status(StatusCode.ServerErrorInternal).json({errorMsg: "UNKNOWN_ERROR"});
    }
});

/*
    Endpoint: /emailverification
    Verifies a user's email based on a hashed link.
    body param url: The url containing the hashed email to verify.
    returns as the response: In param errorMsg an error message type if necessary.
*/
app.post('/emailverification', async (req, res) => {
    const url = req.body.url;

    //IMPORTANT: It finds the link and deletes it if it was successful.
    verificationLinks.findOneAndDelete({link: url}).then((VLINK) => {
        if (VLINK) {
            userSchema.findOne({email: VLINK.email}).then(async (user) => {
                if (user) { //Email was found in database
                    user.emailverified = true;
                    user.save();
                    return res/*.status(StatusCode.SuccessOK)*/.json({errorMsg: ""}); //It was successful
                }
                else {
                    return res/*.status(StatusCode.ClientErrorNotFound)*/.json({errorMsg: "INVALID_EMAIL"});
                }
            })
        }
        else {
            return res/*.status(StatusCode.ClientErrorBadRequest)*/.json({errorMsg: "INVALID_LINK"});
        }
    });
});

/*
    Validates that an image belongs to a user and then sends back the link to the image.
    body param headers.authorization: The user's token.
    query param imageName: The name of the image to load.
    returns as the response: The file link if found, otherwise an error code with a message.
*/
app.get('/getImage', async (req, res) => {
    try {
        //Validate the user's token
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        let imageName = req.query.imageName;

        if (imageName === undefined)
            return res.status(StatusCode.ClientErrorBadRequest).json({msg: "imageName should not be blank."})

        //Check if the specified image is actually owned by the the user
        if (await user.images.includes(imageName))
            res.sendFile(`${__dirname}/images/${userId}/${imageName}`);
        else
            res.status(StatusCode.ClientErrorBadRequest).json({msg: "Invalid request."});
    }
    catch (error) {
        res.status(StatusCode.ClientErrorBadRequest).json({msg: "Invalid token , tried to get an image."});
    }
});

/*
    Deletes an image from the database and from the server storage.
    body param headers.authorization: The user's token.
    query param footIndex: The index of the foot to be deleted: 0 (left) or 1 (right).
                toeIndex: The index of the toe to be deleted.
                imageIndex: The index of the image to be deleted (there might be multiple images for a toe).
                imageName: The name of the image to be deleted.
    returns as the response: A status code with an error message if necessary.
*/
app.get('/deleteImage', async (req, res) => {
    try {
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;

        if (req.query.footIndex === undefined
         || req.query.toeIndex === undefined
         || req.query.imageIndex === undefined
         || req.query.imageName === undefined) //Some query is undefined.
            return res.status(StatusCode.ClientErrorBadRequest).json({msg: "Some query param is undefined."});

        const footIndex = req.query.footIndex;
        const toeIndex = req.query.toeIndex;
        const imageIndex = req.query.imageIndex;
        const imageName = req.query.imageName;

        //Delete the toe from toe data collection
        const toeData = await utils.getToeData(userId);
        if (toeData) {
            try {
                toeData.feet[footIndex].toes[toeIndex].images.splice(imageIndex, 1);
            }
            catch {
                return res.status(StatusCode.ClientErrorBadRequest).json({msg: "Specified toe or foot does not exist."});
            }
        }
        else {
            return res.status(StatusCode.ClientErrorBadRequest).json({msg: "User's toe data couldn't be found."});
        }

        //Delete the toe image from the user collection
        user.images.splice(user.images.findIndex(name => name == imageName), 1);

        //Delete the toe image from the user images folder
        let command = `rm images/${userId}/${imageName}`
        if (config.hostType.includes("Windows"))
            command = `del images\\${userId}\\${imageName}`
        utils.runCommand(command);

        //Saving the new data back to the database
        toeData.save();
        user.save();

        return res.status(StatusCode.SuccessOK).json({msg: "Image deleted successfully."});
    }
    catch {
        return res.status(StatusCode.ServerErrorInternal).json({msg: "An error occurred when attempting to delete an image (might be an invalid token)."});
    }
});

/*
    Find the user's toe data from the DB.
    body param headers.authorization: The user's token.
    returns as the response: The toe data if found. An error code with a message otherwise.
*/
app.get('/getToe', async (req, res) => {
    try {
        var userObject = await utils.loadUserObject(req, res);
        var userId = userObject.id;

        //Get the user's data from the database (take a look at database/toe-dataSchema.js)
        toe_dataSchema.findOne({ userID: userId }).then(data => {
            if (data) //User was found in database
                return res.status(StatusCode.SuccessOK).json(data);
            else
                return res.status(StatusCode.ClientErrorNotFound).json({msg: "Data not found."});
        });
    }
    catch (error) {
        return res.status(StatusCode.ClientErrorBadRequest).json({msg: "Invalid user token."})
    }
});

/*
    Gets a list of image names for a certain user.
    body param headers.authorization: The user's token.
    returns as the response: The list user's images.
*/
app.get('/getImageNames', async (req, res) => {
    try {
        //Validate the user's token.
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        return res.status(StatusCode.SuccessOK).send(user.images);
    }
    catch {
        return res.status(StatusCode.ClientErrorBadRequest).json({msg: "Something happened when tried to get user's image names."});
    }
});


/*
    Other Routes
*/
app.use('/user', userRoutes);
app.use('/upload', uploadImage);
app.use('/forgotpassword', forgotpasswordRoutes);

module.exports = app;
