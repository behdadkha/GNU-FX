var os = require("os");

const config = {
    secretKey: "secretKey",
    database: `mongodb+srv://behdad:Behdad790@user.nurmz.mongodb.net/user?retryWrites=true&w=majority`,
    hostType: os.type()
}

module.exports = config;
