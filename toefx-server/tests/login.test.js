const request = require("supertest");
const app = require('../app');
const config = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const mongoose = require("mongoose");
const UserModel = require('../database/userSchema');
describe('Login endpoint', () => {
    // Correct information entered
    it('Login should pass if correct information is entered', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: "demoTEST@gmail.com",
                password: "123test"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    // Wrong information entered
    it('Login should fail if wrong information is entered', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: "demoT@gmail.com",
                password: "123"
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBeUndefined();
    });

    // Login user validation
    it('Login token should match with JWT token', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: "demo@gmail.com",
                password: "123"
            });
        const payload = {
            id: "5fb6cba87f989d064047700e",
            name: "asdf"
        }
        jwt.sign(payload, config.secretKey, { expiresIn: "1 day" },
            (err, token) => {
                expect(res.body.token).toEqual(token);
            });
    });

    it('Login should fail if text inputs are empty', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: "",
                password: ""
            });
        expect(res.body.msg).toEqual("Required input is empty");
    });
});




