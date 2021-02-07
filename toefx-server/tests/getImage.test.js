const request = require("supertest");
const app = require('../app');
const config = require('../config');
//const mongoose = require("mongoose");
const jestConfig = require('./jest.config');
const utils = require('../utils');
const { promisify } = require('util')
const sleep = promisify(setTimeout)

let TestAuthToken = jestConfig.TestAuthToken;
describe('getImage endpoint', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    })
    it('should fail if there is no token', async () => {
        const res = await request(app).get('/getImage/?imageName=0.PNG');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid token , tried to get an image");
    });
    it('should fail if image name is not specified in the url query', async () => {
        const res = await request(app)
            .get('/getImage')
            .set('Authorization', TestAuthToken);

        sleep(2000).then(() => {
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe("ImageName should be specified");
        })

    });

    it('should pass if image name is correct', async () => {
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));

        const res = await request(app)
            .get('/getImage/?imageName=0.PNG')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toEqual("Invalid request");
        utils.loadUserObject.mockClear();
    });

});

describe('getImageNames endpoint', () => {
    it('should be successful if images in the mockedData is the same as the returned result', async () => {
        let mockedUserSave = jest.fn();
        const mockedData = { user: { save: mockedUserSave, images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));
        const res = await request(app)
            .get('/getImageNames')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(mockedData.user.images);
    });
    
    it('should fail authorization token is not set', async () => {
        utils.loadUserObject.mockRestore();
        const res = await request(app)
            .get('/getImageNames')
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Something happened when tried to get user's image names");
    });
    
});