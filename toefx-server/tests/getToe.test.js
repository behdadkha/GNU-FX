const request = require("supertest");
const app = require('../app');
const config = require('../config');
const mongoose = require("mongoose");
const jestConfig = require('./jest.config');
const utils = require('../utils');
const toeDataSchema = require("../database/toe-dataSchema");

let TestAuthToken = jestConfig.TestAuthToken;
describe('getToe endpoint', () => {
    beforeAll(async () => {
        await mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
        
    });
    it('should fail if there is no token', async () => {
        const res = await request(app).get('/getToe');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid user token");
    });

    it('should return the user toe data if user exists', async () => {
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));

        //mocked toeDataSchema
        toeDataSchema.findOne = jest.fn().mockResolvedValue([{userId: '1',feet : [{toes:[{images:[{date: "2021-01-27",name: "0.PNG",fungalCoverage: "43%"}]},]}]}]);

        const expected = {"feet": [{"toes": [{"images": [{"date": "2021-01-27", "fungalCoverage": "43%", "name": "0.PNG"}]}]}]};
        const res = await request(app)
            .get('/getToe')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].userId).toBe('1');
        expect(res.body[0].feet).toMatchObject(expected.feet);
    });

    it('should fail if user does not have any toe data', async () => {
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));

        toeDataSchema.findOne.mockClear();
        toeDataSchema.findOne = jest.fn().mockResolvedValue();
        const res = await request(app)
            .get('/getToe')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toEqual("Data not found");
    });

});