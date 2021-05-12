/*
    The database schema for storing data related to images uploaded by users.
*/

const { json } = require('body-parser');
const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

const toe_dataSchema = new schema({
    userID : {
        type : ObjectID,
        required : true
    },
    feet : [
        {
            toes:
            [
                //An object for each toe
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fongiqueCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fongiqueCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fongiqueCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fongiqueCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fongiqueCoverage: String
                    }]
                }
            ]
        }
    ]
});

module.exports = mongoose.model('toe',toe_dataSchema, 'toe-data'); //toe-data is the collection name
