const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret_token = process.env.JWT_SECRET_TOKEN;

const generateToken = (id) => {
    //console.log(process.env.JWT_SECRET_TOKEN);
    return jwt.sign({ id }, secret_token, {
        expiresIn: "10d",
    });
};

module.exports = generateToken;
