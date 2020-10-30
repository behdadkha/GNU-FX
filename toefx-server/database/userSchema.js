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
    age: {
        type : Number,
        required : true,
        validate : {
            validator : Number.isInteger,
            message : '{value} is not an integer value'
        }
    },
    date: {
        type : Date,
        default : Date.now
    }

});

module.exports = mongoose.model('user',userSchema, 'users');//users is the collection name