const { request } = require("express");
const mongoose = require("mongoose");
const UserModel = require('../database/userSchema');
const userData = {email: 'demoTEST@gmail.com', password: '123test', name: 'tester', age: '12'};
const config = require('../config');
const mongodbConfig = require("./mongodb-config");
const { MongoClient } = require("mongodb");
describe('User model test', () => {
    beforeAll(async () => {
        await mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });
    // Testing correct information
    it('create and save user', async () => {
        const validUser = new UserModel(userData);
        const savedUser = await validUser.save();
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.age.toString()).toBe(userData.age);
        expect(savedUser.email).toBe(userData.email);
    });
    // Testing input validation
    // Job is not defined in the user schema
    it('create and save user with undefined input', async () => {
        const validUser = new UserModel({email: 'demoTEST@gmail.com', password: '123test', name: 'tester', age: '12', job: "Software engineer"});
        const savedUser = await validUser.save();
        expect(savedUser._id).toBeDefined();
        expect(savedUser.job).toBeUndefined();
    });

    
});