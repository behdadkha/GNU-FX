const { json } = require('body-parser');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

//clinician shema
const clinicianSchema = new schema({
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
    date: {
        type : Date,
        default : Date.now
    },
    patients: {
        type : Array   
    }

});

module.exports = mongoose.model('clinician',clinicianSchema, 'clinicians');//clinicians is the collection name