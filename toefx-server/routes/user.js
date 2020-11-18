const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');
//user schema
const userSchema = require("../database/userSchema");
(async () => {
    try {
        await mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (e) {
        throw e;
    }
})()
userRoutes.route('/getschedule').get((req,res) => {
    try{
        const token = req.headers.authorization;
        const data = jwt.verify(token.replace("Bearer ", ""), config.secretKey);
        const userId = data.id;

        userSchema.findOne({ _id: userId }).then(data => {
            if (data) {
                res.json(data.schedule);
            } else {
                res.status(400).json({msg : "not found"});
            }
        });
    }
    catch(e){
        console.log("Something happened when tried to access toe-data (might be an invalid user)");
    }
});
module.exports = userRoutes;