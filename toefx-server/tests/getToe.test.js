const request = require("supertest");
const app = require('../app');
const config = require('../config');
const jestConfig = require('./jest.config');
const utils = require('../utils');
const toeDataSchema = require("../database/toe-dataSchema");
const { promisify } = require('util')
const sleep = promisify(setTimeout)
let TestAuthToken = jestConfig.TestAuthToken;
describe('getToe endpoint', () => {
    it('should fail if there is no token', async done => {
        const res = await request(app).get('/getToe');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid user token");
        done();
    });
    it('should return the user toe data if user exists', async done => {
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));

        //mocked toeDataSchema
        toeDataSchema.findOne = jest.fn().mockResolvedValue([{ userId: '1', feet: [{ toes: [{ images: [{ date: "2021-01-27", name: "0.PNG", fungalCoverage: "43%" }] },] }] }]);

        const expected = { "feet": [{ "toes": [{ "images": [{ "date": "2021-01-27", "fungalCoverage": "43%", "name": "0.PNG" }] }] }] };
        const res = await request(app)
            .get('/getToe')

        sleep(1000).then(() => {
            expect(res.statusCode).toEqual(200);
            expect(res.body[0].userId).toBe('1');
            expect(res.body[0].feet).toMatchObject(expected.feet);
        })
        done();
    });

    it('should fail if user does not have any toe data', async done => {
        toeDataSchema.findOne = jest.fn().mockResolvedValue([{ userId: '1' }]);
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));

        //toeDataSchema.findOne.mockClear();
        //toeDataSchema.findOne = jest.fn().mockResolvedValue();
        const res = await request(app)
            .get('/getToe')

        sleep(2000).then(() => {
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toEqual("Data not found");
        })
        done();

    });

});