const request = require("supertest");
const app = require('../app');
const config = require('../config');
const mongoose = require("mongoose");
const jestConfig = require("./jest.config");
const utils = require('../utils');

let TestAuthToken = jestConfig.TestAuthToken;
describe('deleteImage endpoint', () => {
    beforeAll(async () => {
        await mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });
    it('should fail if token is not set', async () => {
        const res = await request(app).get('/deleteImage');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Something happened when tried to delete an image (might be an invalid token)");
    });

    it('should fail if query params are not specified', async () => {
        const res = await request(app)
            .get('/deleteImage')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("4 query params are undefined");
    });

    it('should be successful if image is in the database', async () => {
        let mockedUserSave = jest.fn();
        let mockedToeData = jest.fn();
        utils.loadUserObject = jest.fn(() => Promise.resolve({user: {save: mockedUserSave, images: [{name: "0.PNG"}]}, id:"1"}));
        utils.getToeData = jest.fn(() => Promise.resolve({save: mockedToeData, feet:[{ toes:[{images: [{name: "123"}, {name: "456"}] }] }]}));
        utils.runCommand = jest.fn();

        const res = await request(app)
            .get('/deleteImage/?footIndex=0&toeIndex=0&imageIndex=0&imageName=0.PNG')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(200);
        expect(res.body.msg).toBe("Image deleted successfully");
        expect(utils.loadUserObject).toHaveBeenCalledTimes(1);
        expect(mockedUserSave).toHaveBeenCalled();

        expect(utils.getToeData).toHaveBeenCalledTimes(1);
        expect(mockedToeData).toHaveBeenCalled();

        expect(utils.runCommand).toHaveBeenCalledWith("del images\\1\\0.PNG");
    });

    //Edge cases

    it('should fail if toe index is greater than 4', async () => {
        const res = await request(app)
            .get('/deleteImage/?footIndex=0&toeIndex=5&imageIndex=1&imageName=0.PNG')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("specified toe or foot does not exist");
    });

    it('should fail if toe index is less than 0', async () => {
        const res = await request(app)
            .get('/deleteImage/?footIndex=0&toeIndex=-1&imageIndex=1&imageName=0.PNG')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("specified toe or foot does not exist");
    });
    
    it('should fail if foot index is not either 0 or 1', async () => {
        const res = await request(app)
            .get('/deleteImage/?footIndex=2&toeIndex=0&imageIndex=1&imageName=0.PNG')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("specified toe or foot does not exist");
    });

    it('should fail if foot index is not either 0 or 1', async () => {
        const res = await request(app)
            .get('/deleteImage/?footIndex=-1&toeIndex=0&imageIndex=1&imageName=0.PNG')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("specified toe or foot does not exist");
    });

});