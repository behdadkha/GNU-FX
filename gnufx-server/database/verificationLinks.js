/*
    The database schema for verifying users during sign up.
*/

const { json } = require('body-parser');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

const verificationLinks = new schema({
    email: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('links', verificationLinks, 'verificationLinks');
