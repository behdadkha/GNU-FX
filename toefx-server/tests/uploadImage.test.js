const request = require("supertest");
const app = require('../app');
const config = require('../config');
//const mongoose = require("mongoose");
const jestConfig = require('./jest.config');
const utils = require('../utils');
let toeDataSchema = require('../database/toe-dataSchema');
describe('/upload/loggedin endpoint', () => {
    it('should fail if there is no token with real image', async () => {
        const res = await request(app)
            .post('/upload/loggedin')
            .attach('file', './tests/0.JPG');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid token");
    });

    it('should fail if image hasnt been sent', async () => {
        const res = await request(app).post('/upload/loggedin');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid token");
    });

    it('should fail if foot or toe index is not sent', async () => {
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{}] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));
        const res = await request(app)
            .post('/upload/loggedin')
            .attach('file', './tests/0.JPG');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Foot or toe is undefined");
        expect(mockedUserSave).toHaveBeenCalled();
    });

    it('moveImageToUserImages function should fail if the original image is not there', async () => {
        //mocked user and toedata
        let mockedUserSave = jest.fn();
        let mockedData = { user: { save: mockedUserSave, images: [{}] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));
        //Mocked toedata to pass the savetoedata and reach the moveImagetoUserImage(so that toe image does not exist in the user folder)
        toeDataSchema.findOne = jest.fn().mockResolvedValue([{userId: '1',feet : [{toes:[{images:[{date: "2021-01-27",name: "0.PNG",fungalCoverage: "43%"}]},]}]}]);

        const res = await request(app)
            .post('/upload/loggedin')
            .field({foot: '0', toe: '0'})
            .attach('file', './tests/0.JPG');
        expect(res.statusCode).toEqual(500);
        expect(mockedUserSave).toHaveBeenCalled();
        expect(res.body.msg).toBe("Error occured");
    });
});
/*
describe('/upload/notloggedin endpoint', () => {

    it('should fail if there is no token with real image', async () => {
        const formData = new FormData(); //formData contains the image to be uploaded
        fs.readFile('./tests/0.JPG', (err, data) => {
            formData.append("file", data);
        })
        
        formData.append("foot", '1');
        formData.append("toe", '1');

        const res = await request(app)
            .post('/upload/loggedin')
            .send({formData});
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid token");

    });

    it('should fail if image hasnt been sent', async () => {
        const res = await request(app).post('/upload/loggedin');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid token");
    });
});*/