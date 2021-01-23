const request = require("supertest");
const app = require('../app');
const config = require('../config');
const utils = require('../utils');
const mongoose = require("mongoose");

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
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjZjYmE4N2Y5ODlkMDY0MDQ3NzAwZSIsIm5hbWUiOiJhc2RmIiwiaWF0IjoxNjExNDM4NDQ3LCJleHAiOjE2MTE1MjQ4NDd9.NHKBl87hDdH4QejezoHBkxSQfX6ayIiTAlQ2fM9SG4U');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid request");
    });

    it('getImage should pass if image name is correct', async () => {
        const res = await request(app)
            .get('/getImage/?imageName=0.PNG')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjZjYmE4N2Y5ODlkMDY0MDQ3NzAwZSIsIm5hbWUiOiJhc2RmIiwiaWF0IjoxNjExNDM4NDQ3LCJleHAiOjE2MTE1MjQ4NDd9.NHKBl87hDdH4QejezoHBkxSQfX6ayIiTAlQ2fM9SG4U');
        expect(res.statusCode).toEqual(200);
    });

});