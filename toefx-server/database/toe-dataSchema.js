const { json } = require('body-parser');
const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

//toe-data shema
/*const toe_dataSchema = new schema({
    userID : {
        type : ObjectID,
        required : true
    },
    rightFoot : {
        type : Object,
        required : false,

        first_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        second_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        third_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        fourth_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        fifth_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

    },
    leftFoot : {
        type : Object,
        required : false,

        first_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        second_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        third_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        fourth_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

        fifth_toe : [{
            date: Date,
            image : String,
            fungalCoverage : String
        }],

    }

});*/

const toe_dataSchema = new schema({
    userID : {
        type : ObjectID,
        required : true
    },
    feet : [
        {
            toes:
            [
                //an object for each toe
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fungalCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fungalCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fungalCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fungalCoverage: String
                    }]
                },
                {
                    images:
                    [{
                        date: Date,
                        name: String,
                        fungalCoverage: String
                    }]
                }
            ]
        }
    ]
});

module.exports = mongoose.model('toe',toe_dataSchema, 'toe-data');//toe-data is the collection name