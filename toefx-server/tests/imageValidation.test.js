const request = require("supertest");
const app = require('../app');
const config = require('../config');
const mongoose = require("mongoose");
const jestConfig = require('./jest.config');
const utils = require('../utils');
const { promisify } = require('util')
const sleep = promisify(setTimeout)
let TestAuthToken = jestConfig.TestAuthToken;
describe('/imageValidation/loggedin endpoint', () => {
    /*
    it('should fail if there is no token', async () => {
        const res = await request(app).get('/imageValidation/loggedin');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Failed! Token or user not valid");
    });
    */
    it('should fail if database is empty', async () => {
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{}] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));
        const res = await request(app)
            .get('/imageValidation/loggedin')
            .set('Authorization', TestAuthToken);

        sleep(2000).then(() => {
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe("No image found in the database");
        })

    });

    it('should pass run command is successful', async () => {
        const mockedData = { user: { save: jest.fn(), images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));
        utils.runCommand = jest.fn(() => "healthy")
        const res = await request(app)
            .get('/imageValidation/loggedin')

        sleep(1000).then(() => {
            expect(res.text).toBe("healthy");
        })
        
    });

    it('should pass if auth token is valid', async () => {
        utils.runCommand = jest.fn(() => "healthy")
        const res = await request(app)
            .get('/imageValidation/loggedin')
            .set('Authorization', TestAuthToken)
        expect(res.text).toBe("healthy");
    });

});

describe('imageValidation/notloggedin endpoint', () => {
    it('should fail if image name is not sent as a parameter', async () => {
        const res = await request(app).post('/imageValidation/notloggedin');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Image name not specified");
    });

    it('should be successful if runCommand has run successfully', async () => {
        utils.runCommand = jest.fn(() => "healthy")
        const res = await request(app).post('/imageValidation/notloggedin').send({ myimg: "0.PNG" });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe("healthy");
    });
});