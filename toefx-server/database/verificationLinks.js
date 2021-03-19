const { json } = require('body-parser');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

//verification shema
const verificationLinks = new schema({
    email: {
        type: String,
        required: false
    },
    link : {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('links', verificationLinks, 'verificationLinks');