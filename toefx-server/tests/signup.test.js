const mongoose = require("mongoose");
const UserModel = require('../database/userSchema');
const config = require('../config');
const mongodbConfig = require("./mongodb-config");
const { MongoClient } = require("mongodb");

const userData = {email: 'demoTEST@gmail.com', password: '123test', name: 'tester', age: '12'};
const request = require("supertest");
const app = require('../app');
const userSchema = require("../database/userSchema");
const jestConfig = require("./jest.config");

describe('Signup endpoint', () => {
    it('should pass if everything is entered correctly', async () => {
        //mocked userschema save
        jest.spyOn(userSchema.prototype, 'save').mockImplementationOnce(() => Promise.resolve());
        const res = await request(app)
            .post('/signup')
            .send({
                name: "tester2",
                email: "demoTEST2@gmail.com",
                password: "123",
                age: '12',

            });
        expect(res.statusCode).toEqual(200);
    })
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

    it('Signup should fail if nothing is sent and it is expecting four', async () => {
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

    it('Signup should fail if email address is not in the correct format', async () => {
        const res = await request(app)
            .post('/signup').send({
                name: "Bob Smith",
                email: "demoTESTgmail.com",
                password: "123",
                age: "22"
            })
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("invalid email address");
    });
    
});