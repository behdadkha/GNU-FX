var os = require("os");

const config = {
    secretKey: "secretKey",
    database: `mongodb+srv://behdad:ToeFXDev2021@user.nurmz.mongodb.net/user?retryWrites=true&w=majority`,
    hostType: os.type(),
    dev_client : "http://localhost:3000",
    dev_email: "toefxdevteam@gmail.com",
    dev_epass: "Toefxdevteam123"
}

module.exports = config;
