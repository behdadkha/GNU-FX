const UserModel = require('../database/userSchema');
const config = require('../config');
const mongodbConfig = require("./mongodb-config");
const { MongoClient } = require("mongodb");

const userData = {email: 'demoTEST@gmail.com', password: '123test', name: 'tester', birthday: '12'};
const request = require("supertest");
const app = require('../app');
const userSchema = require("../database/userSchema");
const jestConfig = require("./jest.config");

describe('Signup endpoint', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    })
    it('should pass if everything is entered correctly', async done => {
        //mocked userschema save
        jest.spyOn(userSchema.prototype, 'save').mockImplementationOnce(() => Promise.resolve());
        const res = await request(app)
            .post('/signup')
            .send({
                name: "tester2",
                email: "demoTEST2@gmail.com",
                password: "123",
                birthday: '12',

            });
        expect(res.statusCode).toEqual(400);
        done();
    })
    it('Signup should fail with empty name, email, password and age', async done => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "",
                email: "",
                password: "",
                birthday: "",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("BLANK_FIELD");
        done();
    });

    it('Signup should fail if name is empty', async done => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "",
                email: "demo@gmail.com",
                password: "123",
                birthday: "22",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("BLANK_FIELD");
        done();
    });

    it('Signup should fail if email is empty', async done => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "bob smith",
                email: "",
                password: "123",
                birthday: "22",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("BLANK_FIELD");
        done();
    });

    it('Signup should fail if password is empty', async done => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "Bob smith",
                email: "demo@gmail.com",
                password: "",
                birthday: "22",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("BLANK_FIELD");
        done();
    });

    it('Signup should fail if age is empty', async done => {
        const res = await request(app)
            .post('/signup')
            .send({
                name: "Bob smith",
                email: "demo@gmail.com",
                password: "123",
                birthday: "",

            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("BLANK_FIELD");
        done();
    });

    it('Signup should fail if nothing is sent and it is expecting four', async done => {
        const res = await request(app)
            .post('/signup').send({})
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("BLANK_FIELD");
        done();
    });

    it('Invalid password given', async done => {
        const res = await request(app)
            .post('/signup').send({
                name: "Bob Smith",
                email: "demoTEST@gmail.com",
                password: "123",
                birthday: "22"
            })
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("INVALID_PASSWORD");
        done();
    });

    it('Signup should fail if email address is not in the correct format', async done => {
        const res = await request(app)
            .post('/signup').send({
                name: "Bob Smith",
                email: "demoTESTgmail.com",
                password: "123",
                birthday: "22"
            })
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorMsg).toBe("INVALID_EMAIL");
        done();
    });
    
});