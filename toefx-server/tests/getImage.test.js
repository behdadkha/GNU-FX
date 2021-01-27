const request = require("supertest");
const app = require('../app');
const config = require('../config');
const mongoose = require("mongoose");
const jestConfig = require('./jest.config');

let TestAuthToken = jestConfig.TestAuthToken;
describe('getimage endpoint', () => {
    beforeAll(async () => {
        await mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });
    it('getImage should fail if there is no token', async () => {
        const res = await request(app).get('/getImage');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid token , tried to get an image");
    });

    it('getImage should fail if image name is not specified in the url query', async () => {
        const res = await request(app)
            .get('/getImage')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid request");
    });

    it('getImage should pass if image name is correct', async () => {
        const res = await request(app)
            .get('/getImage/?imageName=0.PNG')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
    });

});