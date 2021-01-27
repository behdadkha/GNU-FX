const mongoose = require("mongoose");
const UserModel = require('../database/userSchema');
const config = require('../config');
const mongodbConfig = require("./mongodb-config");
const { MongoClient } = require("mongodb");

const userData = {email: 'demoTEST@gmail.com', password: '123test', name: 'tester', age: '12'};
const request = require("supertest");
const app = require('../app');

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
});

describe('Signup endpoint', () => {
    beforeAll(async () => {
        await mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

    it('Signup should fail with empty name, email, password and age', async () => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "",
                email: "",
                password: "",
                age: "",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Required input is empty");
    });

    it('Signup should fail if name is empty', async () => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "",
                email: "demo@gmail.com",
                password: "123",
                age: "22",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Required input is empty");
    });

    it('Signup should fail if email is empty', async () => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "bob smith",
                email: "",
                password: "123",
                age: "22",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Required input is empty");
    });

    it('Signup should fail if password is empty', async () => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "Bob smith",
                email: "demo@gmail.com",
                password: "",
                age: "22",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Required input is empty");
    });

    it('Signup should fail if age is empty', async () => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "Bob smith",
                email: "demo@gmail.com",
                password: "123",
                age: "",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Required input is empty");
    });

    it('Signup should fail if only one input is sent and it is expecting four', async () => {
        const res = await request(app)
            .post('/signup').send({})
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Required input is undefined");
    });

    it('Signup should fail if account already exists', async () => {
        const res = await request(app)
            .post('/signup').send({
                name: "Bob Smith",
                email: "demoTEST@gmail.com",
                password: "123",
                age: "22"
            })
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Account already exists");
    });
    
});