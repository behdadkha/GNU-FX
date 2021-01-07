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

app.use(cors());
app.use(fileUpload());
app.use(express.static('./images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const mongoose = require('mongoose');
//user schema
const userSchema = require("./database/userSchema");

//clinician schema
//const clinicianSchema = require("./database/clinicianSchema");

//toe-data schema
const toe_dataSchema = require("./database/toe-dataSchema");


//Upload Image
const uploadImage = require('./routes/uploadImage');
//ImageValidation routes
const imageValidationRoutes = require('./routes/ImageValidation');
//diagnose Image
const diagnoseRouter = require('./routes/diagnose');
//user routes
const userRoutes = require('./routes/user');

const { resolve } = require('path');
const { exec } = require("child_process");

//database Connection
(async () => {
    try {
        await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (e) {
        throw e;
    }
})();


//function to find people in the database
function findPeople(userId, res) {
    return new Promise((resolve, reject) => {
        userSchema.findOne({ _id: userId }).then(user => {
            if (user) {
                resolve(user);
            } else {//the email address is not found
                res.status(400).json(undefined);
                resolve();
            }
        })
    })
}
module.exports.findPeople = findPeople;
//function to run an exec command(cl)
//runs the given command and returns a promise
//resolve passes the command line output
function runCommand(command) {
    const { exec } = require("child_process");
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


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    //search for the provided email in the database
    userSchema.findOne({ email: email }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password).then(valid => {
                if (valid) {
                    const payload = {
                        id: user.id,
                        name: user.name
                    };

                    jwt.sign(payload, config.secretKey, { expiresIn: "1 day" }, //31556926
                        (err, token) => {
                            res.json({
                                success: true,
                                token: "Bearer " + token
                            });
                        }
                    );
                } else {
                    return res.status(400).json(undefined);
                }
            });

        } else {//the email address is not found
            res.status(400).json(undefined);
        }
    });


});

//login for clinician
app.post('/loginClinician', (req, res) => {
    const { email, password } = req.body;

    //search for the provided email in the database
    clinicianSchema.findOne({ email: email }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password).then(valid => {
                if (valid) {
                    const payload = {
                        id: user.id,
                        name: user.name
                    };

                    jwt.sign(payload, config.secretKey, { expiresIn: "1 day" }, //31556926
                        (err, token) => {
                            res.json({
                                success: true,
                                token: "Bearer " + token
                            });
                        }
                    );
                } else {
                    return res.status(400).json(undefined);
                }
            });

        } else {//the email address is not found
            res.status(400).json(undefined);
        }
    });


});


//creates a new user in the database
//creates a new folder with userid as its name in the images folder
//returns a 200 as the response
app.post('/signup', (req, res) => {
    const { name, email, password, age } = req.body;

    try {
        userSchema.findOne({ email: email }).then(user => {
            //the email address already exists
            if (user) {
                return res.status(400).json({ msg: "Account already exists" });
            } else {
                //user does not exist

                //hash rounds
                const rounds = 10
                //hash the password
                bcrypt.genSalt(rounds, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;

                        //creating a new user with the hashed password
                        const newUser = new userSchema({ email: email, name: name, password: hash, images: [], age: age });
                        newUser.save().then(() => {
                            console.log("new user added to db");

                            //create a folder for the user's images
                            console.log(newUser.id);
                            runCommand(`cd images && mkdir ${newUser.id}`)

                            res.status(200).json({});

                        }).catch(err => console.log(err));
                    });
                });
            }
        });
    } catch {
        console.log("not able to finish the signup process");
    }
});


//serve user images back to the client app
//finds the person in the database and gets the images
//react sends an authorization token. Decodes it here and gets the id, using that id validates the user
app.get('/getImage', async (req, res) => {

    try {
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        //if the token is invalid
        if (data == undefined) {
            res.status(500).send({ msg: "Error occured" });
        }

        let user = await findPeople(userId, res);
        let imageName = req.query.imageName;

        //if the specified images is actually owned by the the user
        if (await user.images.includes(imageName)) {
            res.sendFile(`${__dirname}/images/${userId}/${imageName}`);
        }
        else {
            res.status(400).json({ msg: "Invalid request" });
        }
    } catch (e) {
        //console.log(e)
        console.log("invalid token , tried to get an image");
    }
});

//get the toe data from the database and send it back to the client
app.get('/getToe', (req, res) => {

    try {
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        if (data == undefined) {
            res.status(500).send({ msg: "Error occured" });
        }

        //find the user's data from the database(take a look at database/toe-dataSchema.js)
        toe_dataSchema.findOne({ userID: userId }).then(data => {
            if (data) {
                res.json(data);
            } else {
                res.status(400).json({ msg: "not found" });
            }
        });
    }
    catch (e) {
        console.log("Something happened when tried to access toe-data (might be an invalid user)");
    }

});

//send the list of the name of user's images
app.get('/getImageNames', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        if (data == undefined) {
            res.status(500).send({ msg: "Error occured" });
        }

        let user = await findPeople(userId, res);
        res.send(user.images)

    } catch {
        console.log("Something happened when tried to get user's image names");
    }
});

//handles image upload
//moves the uploaded image into the images folder under the current user
//uploading Image
app.use('/upload', uploadImage);

//validating images
app.use('/imageValidation', imageValidationRoutes);

//runs the fungal diagnose python script
//returns as response, health, unhealthy
app.use('/diagnose', diagnoseRouter);

//everything after /user 
app.use('/user', userRoutes);



app.listen(process.env.PORT || 3001, () => {
    console.log("server running on 3001");
});