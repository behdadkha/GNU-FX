const request = require("supertest");
const app = require('../app');
const jestConfig = require("./jest.config");
const utils = require('../utils');
let TestAuthToken = jestConfig.TestAuthToken;



describe('diagnose/loggedin endpoint', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it('should fail if token is not set', async () => {

        const res = await request(app).get('/diagnose/loggedin');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Failed! Token or user not valid");

    });

    it('should fail if there is no image in the database', async () => {
        let mockedUserSave = jest.fn();
        const mockedData = { user: { save: mockedUserSave, images: [{}] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));

        const res = await request(app)
            .get('/diagnose/loggedin')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("No image found in the database");
    });

    it('GetAndSendDiagnosisOutput should pass if user and imagename are correct', async () => {
        const mockedData = { user: { save: jest.fn(), images: [{ name: "0.PNG" }] }, id: "1" };
        utils.loadUserObject = jest.fn(() => Promise.resolve(mockedData));
        utils.runCommand = jest.fn(() => "healthy")
        const res = await request(app)
            .get('/diagnose/loggedin')
        expect(res.text).toBe("healthy");

    });

    it('should pass if auth token is valid', async () => {
        utils.runCommand = jest.fn(() => "healthy")
        const res = await request(app)
            .get('/diagnose/loggedin')
            .set('Authorization', TestAuthToken)
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe("healthy");
    });
});

describe('diagnose/notloggedin endpoint', () => {
    it('should fail if image name is not sent as a query param', async () => {
        const res = await request(app).get('/diagnose/notloggedin');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Image name not specified");
    });

    it('should fail if image name is not sent as a query param', async () => {
        utils.runCommand = jest.fn(() => "healthy")
        const res = await request(app).get('/diagnose/notloggedin/?imageName=0.PNG');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe("healthy");
    });
});