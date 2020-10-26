const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { stderr } = require('process');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


app.use(cors());
app.use(fileUpload());
app.use(express.static('./images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', (req,res) =>{
    const {email, password} = req.body;

    bcrypt.compare(password, "$2a$10$A1ZabqaQUvpqL.SUSUrfkO6Xw9zrYnq1ykV6w/RwLbcNEMIfkaoOW").then(valid => {
        if(valid){
            const payload = {
                id : 1,
                name: "Behdad"
            };

            jwt.sign(payload, "secretKey", {expiresIn : "120"} , //31556926
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





    /*if (email === "behdad@gmail.com" && password === "behdad"){
        res.json({"name" : "behdad"});
    }else{
        res.status(401).json(undefined);
    }*/
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

app.get('/diagnose', (req,res)=>{
    const imageName = req.query.imageName;
    console.log("analyzing: " + imageName);
    const { exec } = require("child_process");
    let command = `cd ./AI && python predict.py ../images/${imageName}`;
    exec(command, (err, stdout, stderr) => {
        res.send(stdout.split(" ")[0]);
    });
});

app.listen(3001, () =>{
    console.log("server running on 3001");
});