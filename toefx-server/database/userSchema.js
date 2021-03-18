const { json } = require('body-parser');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

//user shema
const userSchema = new schema({
    email: {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    name: {
        type : String,
        required : true
    },
    birthday: {
        type : String,
        required : false,
    },
    images: {
        type : Array,
        required : false
    },
    imageIndex: {
        type: Number,
        default: 0
    },
    date: {
        type : Date,
        default : Date.now
    },
    schedule: {
        type: Array,
        required : false
    },
    emailverified:{
        type: Boolean,
        required : false
    }

});

module.exports = mongoose.model('user',userSchema, 'users');//users is the collection name