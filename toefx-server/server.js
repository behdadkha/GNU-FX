const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { stderr } = require('process');
const {MongoClient} = require('mongodb');
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



//database Connection
(async () => {
    try{
        await mongoose.connect(config.database, {useNewUrlParser : true, useUnifiedTopology : true});
    }catch(e){
        throw e;
    }
})()


app.post('/login', (req,res) =>{
    const {email, password} = req.body;

    //search for the provided email in the database
    userSchema.findOne({email : email}).then(user => {
        if(user){
            bcrypt.compare(password, user.password).then(valid => {
                if(valid){
                    const payload = {
                        id : user.id,
                        name: user.name
                    };
        
                    jwt.sign(payload, config.secretKey, {expiresIn : "1 day"} , //31556926
                        (err,token) => {
                            res.json({
                                success: true,
                                token : "Bearer " + token
                            });
                        }
                    );
                }else{
                    return res.status(400).json(undefined);
                }
            });

        }else{//the email address is not found
            res.status(400).json(undefined);
        }
    });

    
});

app.post('/signup', (req,res) => {
    const {name, email, password, age} = req.body;
    
    userSchema.findOne({email : email}).then(user => {
        //the email address already exists
        if(user){
            return res.status(400).json({msg: "Account already exists"});
        }else{
            //user does not exist
            //hash rounds
            const rounds = 10
            //hash the password
            bcrypt.genSalt(rounds, (err,salt) => {
                bcrypt.hash(password, salt, (err,hash) => {
                    if (err) throw err;

                    //creating a new user with the hashed password
                    const newUser = new userSchema({email : email, name : name, password : hash, age: age});
                    newUser.save().then(() => {
                        console.log("new user added to db")
                        res.status(200).json({});
                    }).catch(err => console.log(err));
                });
            });
        }
    });
    
    

});

app.post('/upload',(req,res)=>{
    const image = req.files.file;
    image.mv(`${__dirname}/images/${image.name}`, (err) => {
        if(err) {
            console.log(err);
            return res.status(500).send({ msg : "Error occured"});
        }
    });
});

app.get('/imagevalidation', (req,res)=>{
    const imageName = req.query.imageName;
    console.log("Checking iamge: " + imageName);
    const { exec } = require("child_process");
    let commandCheckImage = `cd ./AI/imagecheck && python3 predictToeOrNot.py ../../images/${imageName}`;
    exec(commandCheckImage, (err, stdout, stderr) => {
        //if(stderr) console.log(stderr);
        //for some reason the first line is /toefx-server when run in docker
        res.send(stdout);
    });
});

app.get('/diagnose', (req,res) =>{
    const imageName = req.query.imageName;
    console.log("analyzing: " + imageName);
    const { exec } = require("child_process");
    let commandCheckImage = `cd ./AI/diagnose && python3 predict.py ../../images/${imageName}`;
    exec(commandCheckImage, (err, stdout, stderr) => {
        res.send(stdout.split(" ")[0]);
    }); 
})

app.listen(process.env.PORT || 3001 , () =>{
    console.log("server running on 3001");
});