const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { stderr } = require('process');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');
const utils = require('./utils');
const uploadImage = require('./routes/uploadImage');
const imageValidationRoutes = require('./routes/ImageValidation');
const diagnoseRouter = require('./routes/diagnose');
const userRoutes = require('./routes/user');

app.use(cors());
app.use(fileUpload());
app.use(express.static('./images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');


/*
    database schemas
*/
const userSchema = require("./database/userSchema");
const toe_dataSchema = require("./database/toe-dataSchema");

//database Connection
(async () => {
    try {
        await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (e) {
        throw e;
    }
})();

/*
    Creates a folder in folder /images.
    The folder will be user for storing the images.
    Param userId: the folder's name referring the the folder owner.
*/
function createImageFolder(userId) {
    return new Promise((resolve, reject) => {
        utils.runCommand(`cd images && mkdir ${userId}`).then(() => {
            resolve();
        })
    })
}

/*
    Creates a new user in the database.
    It hashes the given password and only stores the hashed value.
    Param name: the name given by the user in the signup form.
    Param email: the email address given by the user.
    Param password: the password in text given by the user.
    Param age: user's age.
*/
function createNewUser(name, email, password, age) {
    return new Promise((resolve, reject) => {
        //hash rounds
        const rounds = 10;
        //hash the password
        bcrypt.genSalt(rounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                //creating a new user with the hashed password
                const newUser = new userSchema({ email: email, name: name, password: hash, images: [], age: age });
                newUser.save().then(() => {
                    console.log("new user added to db");
                    resolve(newUser);

                }).catch(err => console.log(err));
            });
        });
    });
}

/*
    Creates a new object in the toe-data (database) for a new user.
*/
function createEmptyToeEntery(userId) {
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
    creates a signed jwt token.
    Sent to the user on login
    returns a promise with the token if resolved.
*/
function createSignedToken(payload, key, expiresIn) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, key, { expiresIn: expiresIn },
            (err, token) => {
                resolve(token);
            })
    });
};


/*
    Login endpoint.
    Finds the user in the database and returns as the response a jwt token representing the user.
    Body Param email: user's email address.
    Body Param password: user's password in text.  
*/
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if(email === "" || password === ""){return res.status(400).json({msg: "Required input is empty"});}
    //searching for the provided email in the database
    try {
        userSchema.findOne({ email: email }).then(user => {
            if (user) {
                bcrypt.compare(password, user.password).then(async (valid) => {
                    if (valid) {
                        const payload = {
                            id: user.id,
                            name: user.name
                        };

                        var token = await createSignedToken(payload, config.secretKey, "1 day");
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                    else {
                        return res.status(400).json(undefined);
                    }
                });

            }
            else { //the email address is not found
                res.status(400).json(undefined);
            }
        });
    }
    catch {
        console.log("Login failed");
    }
});

/*
    If any of the required inputs are empty or undefined, returns an error message
*/
function checkInput(name, email, password, age) {
    // if required input is empty
    if (name === "" || email === "" || password === "" || age === "") {
        return ("Required input is empty");
    }
    //if required input is undefined
    else if (name === undefined || email === undefined || password === undefined || age === undefined) {
        return ("Required input is undefined");
    }
    else {
        return ("NOERROR");
    }
}

function validateEmail(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/*
    signup endpoint.
    Creates a new user and an image folder for the new user. 
    returns a 200 response if successful, 400 otherwise
    Param name: the name given by the user in the signup form.
    Param email: the email address given by the user.
    Param password: the password in text given by the user.
    Param age: user's age.
*/
app.post('/signup', (req, res) => {

    const { name, email, password, age } = req.body;
    const inputValidMsg = checkInput(name, email, password, age);
    if (inputValidMsg !== "NOERROR") {
        return res.status(400).json({ msg: inputValidMsg });
    }
    if(!validateEmail(email)){
        return res.status(400).json({ msg: "invalid email address" });
    }

    try {
        userSchema.findOne({ email: email }).then(async (user) => {
            //the email address already exists
            if (user) {
                return res.status(400).json({ msg: "Account already exists" });
            }
            else {
                try {
                    //creating a new user
                    const user = await createNewUser(name, email, password, age);
                    //creating a new image folder for the user
                    createImageFolder(user.id).then(() => {
                        createEmptyToeEntery(user.id).then(() => {
                            res.status(200).json({});
                        });
                    })
                }
                catch {
                    res.status(400).json();
                }
            }
        });
    }
    catch {
        console.log("not able to finish the signup process");
    }
});

/*
    Recieves an image name as the query parameter and checks if the image belongs to the user
    if it is valid, it sends back the file as the response.
    Query Param imageName: the name of the image to be sent.
*/
app.get('/getImage', async (req, res) => {
    try {
        //validating the user token
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;
        let imageName = req.query.imageName;
        if (imageName === undefined){return res.status(400).json({msg: "ImageName should be specified"})}
        //if the specified images is actually owned by the the user
        if (await user.images.includes(imageName))
            res.sendFile(`${__dirname}/images/${userId}/${imageName}`);
        else
            res.status(400).json({ msg: "Invalid request" });
    }
    catch (e) {
        //console.log(e)
        res.status(400).json({ msg: "Invalid token , tried to get an image" });
    }
});

/*
    deletes an image from the database and from the server storage
    requires 4 query string params
    footIndex: the index of the foot to be deleted, 0: left foot, 1: right foot
    toeIndex: the index of the toe to be deleted
    imageIndex: the index of the image to be deleted. we might have multiple images for a toe.
    imageName: the name of the image to be deleted. 
*/
app.get('/deleteImage', async (req, res) => {
    try {
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        var userId = userObject.id;

        if(req.query.footIndex === undefined || req.query.toeIndex === undefined || req.query.imageIndex === undefined || req.query.imageName === undefined){
            return res.status(400).json({msg: "4 query params are undefined"});
        }

        const footIndex = req.query.footIndex;
        const toeIndex = req.query.toeIndex;
        const imageIndex = req.query.imageIndex;
        const imageName = req.query.imageName;

        //Delete the toe from toe data collection
        const toeData = await utils.getToeData(userId);
        if (toeData) {
            try {
                toeData.feet[footIndex].toes[toeIndex].images.splice(imageIndex, 1);
            } catch {
                return res.status(400).json({ msg: "specified toe or foot does not exist" });
            }
        }
        else {
            return res.status(400).json({ msg: "not found" });
        }

        //deleting the toe image from the user collection
        user.images.splice(user.images.findIndex(name => name == imageName), 1);

        //deleting the toe image from the user images folder
        let command = `rm images/${userId}/${imageName}`
        if (config.hostType.includes("Windows"))
            command = `del images\\${userId}\\${imageName}`
        utils.runCommand(command);

        //saving the new data in the database
        toeData.save();
        user.save();

        return res.status(200).json({msg: "Image deleted successfully"});
    }
    catch {
        return res.status(400).json({msg: "Something happened when tried to delete an image (might be an invalid token)"})
    }
});

/*
    Find the user's toe data from the DB.
    Returns as the response: the toe data.
*/
app.get('/getToe', async (req, res) => {

    try {
        var userObject = await utils.loadUserObject(req, res);
        var userId = userObject.id;

        //find the user's data from the database(take a look at database/toe-dataSchema.js)
        toe_dataSchema.findOne({ userID: userId }).then(data => {
            if (data) {
                return res.json(data);
            } else {
                return res.status(400).json({ msg: "Data not found" });
            }
        });
    }
    catch (e) {
        return res.status(400).json({msg: "Invalid user token"})
    }
});

/*
    returns as the response: the list user's images
*/
app.get('/getImageNames', async (req, res) => {
    try {
        var userObject = await utils.loadUserObject(req, res);
        var user = userObject.user;
        return res.send(user.images)
    }
    catch {
        return res.status(400).json({msg: "Something happened when tried to get user's image names"});
    }
});

/*
    other Routes
*/
app.use('/upload', uploadImage);
app.use('/imageValidation', imageValidationRoutes);
app.use('/diagnose', diagnoseRouter);
app.use('/user', userRoutes);

module.exports = app;