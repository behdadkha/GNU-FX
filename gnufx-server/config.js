/*
    Various configuration details for the server.
*/

var os = require("os");

const config = {
    secretKey: "secretKey",
    database: `mongodb+srv://behdad:toefxDev2021@user.nurmz.mongodb.net/user?retryWrites=true&w=majority`,
    hostType: os.type(),
    dev_client : "http://localhost:3000",
    dev_email: "toefxdevteam@gmail.com",
    dev_epass: "toefxdevteam123"
}

module.exports = config;
