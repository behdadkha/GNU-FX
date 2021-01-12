const jwt = require('jsonwebtoken');
const { exec } = require('child_process');

const userSchema = require('./database/userSchema');
const toe_dataSchema = require('./database/toe-dataSchema');
const config = require('./config');


//function to find people in the database
function findPeople(userId, res) {
    return new Promise((resolve, reject) => {
        userSchema.findOne({ _id: userId }).then(user => {
            if (user) {
                resolve(user);
            } else {//the email address is not found
                res.status(400).json(undefined);
                reject();
            }
        })
    })
}


function getToeData(userId){
    return new Promise((resolve, reject) => {
        toe_dataSchema.findOne({ userID: userId }).then(data => {
            if(data)
                resolve(data);
            else
                reject();
        });
    });
    
}


//function to run an exec command(cl)
//runs the given command and returns a promise
//resolve passes the command line output
function runCommand(command) {
    
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                reject();
            };
            resolve(stdout);
        });
    });

}

function validateUser(jwtToken, res) {
    const data = jwt.verify(jwtToken.replace("Bearer ", ""), config.secretKey);

    if (data == undefined) {
        res.status(500).send({ msg: "Error occured" });
    }

    const userId = data.id;
    return userId;
}


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

module.exports.findPeople = findPeople;
module.exports.runCommand = runCommand;
module.exports.validateUser = validateUser;
module.exports.getToeData = getToeData;
module.exports.emptyFeet = emptyFeet;