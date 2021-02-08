const request = require("supertest");
const app = require('../app');
const config = require('../config');
const jestConfig = require("./jest.config");

const TestAuthToken = jestConfig.TestAuthToken;
describe('/user/getUserInfo endpoint', () => {
    it('Should fail if authorization header is not set', async done => {
        const res = await request(app).get('/user/getUserInfo');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Couldnt get user's info at /getUserInfo.");
        done();
    });

    it('Should pass if authorization header is set', async done => {
        const res = await request(app)
            .get('/user/getUserInfo')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
        done();
    });

    it('Should return the correct information based on the token', async done => {
        const demoEmail = "demo@gmail.com";
        const demoAge = 12;
        const res = await request(app)
            .get('/user/getUserInfo')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toBe(demoEmail);
        expect(res.body.age).toBe(demoAge);
        done();
    });

});

describe('/user/getschedule endpoint', () => {
    it('Should fail if authorization header is not set', async done => {
        const res = await request(app).get('/user/getschedule');
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("An error occurred while attempting to retrieve a user's schedule. Possibly due to an invalid user.");
        done();
    });

    it('Should pass if authorization header is set', async done => {
        const res = await request(app)
            .get('/user/getschedule')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
        done();
    });

    it('Should return the user schedule based on the provided token', async done => {
        const TestComment = "first treatment";
        const TestDate = "2020-11-01";
        const TestDoctor = "My Doctor";
        const res = await request(app)
            .get('/user/getschedule')
            .set('Authorization', TestAuthToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].comment).toBe(TestComment);
        expect(res.body[0].date).toBe(TestDate);
        expect(res.body[0].doctor).toBe(TestDoctor);
        done();
    });

});

describe('/user/resetPassword endpoint', () => {
    it('Should fail if currentPassword is empty', async done => {
        const res = await request(app)
            .post('/user/resetPassword')
            .send({
                currentPassword: "",
                newPassword1: "newpass",
                newPassword2: "newpass"
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("All the inputs have to be filled");
        done();
    });

    it('Should fail if newPassword1 is empty', async done => {
        const res = await request(app)
            .post('/user/resetPassword')
            .send({
                currentPassword: "123",
                newPassword1: "",
                newPassword2: "newpass"
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("All the inputs have to be filled");
        done();
    });

    it('Should fail if newPassword2 is empty', async done => {
        const res = await request(app)
            .post('/user/resetPassword')
            .send({
                currentPassword: "123",
                newPassword1: "newpass",
                newPassword2: ""
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("All the inputs have to be filled");
        done();
    });

    it('Should fail if authorzation token is not set', async done => {
        const res = await request(app)
            .post('/user/resetPassword')
            .send({
                currentPassword: "123",
                newPassword1: "newpass",
                newPassword2: "newpass"
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Something went wrong");
        done();
    });

    it('Should fail if currentPassword is incorrect', async done => {
        const res = await request(app)
            .post('/user/resetPassword')
            .set('Authorization', TestAuthToken)
            .send({
                currentPassword: "wrongePassword",
                newPassword1: "newpass",
                newPassword2: "newpass"
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("Invalid password");
        done();
    });

    it('Should fail if newPasswords do not match', async done => {
        const res = await request(app)
            .post('/user/resetPassword')
            .set('Authorization', TestAuthToken)
            .send({
                currentPassword: "123",
                newPassword1: "newpass",
                newPassword2: "newpassS"
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe("New passwords don't match");
        done();
    });

    


});


