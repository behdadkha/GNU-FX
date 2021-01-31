/*
    Various utility functions for the server.
*/

const jwt = require('jsonwebtoken');
const {exec} = require('child_process');
const userSchema = require('./database/userSchema');
const toeDataSchema = require('./database/toe-dataSchema');
const config = require('./config');


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

//Exports
module.exports.loadUserObject = loadUserObject;
module.exports.runCommand = runCommand;
module.exports.getToeData = getToeData;
module.exports.emptyFeet = emptyFeet;
