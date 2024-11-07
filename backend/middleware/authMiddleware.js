const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
    let token;
    const secret = process.env.JWT_SECRET_TOKEN;
    // condition checks if there is a token in request.header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // token will be something like : Bearer lakagdsaalgkasginae...
            token = req.headers.authorization.split(" ")[1];
            //decode token from req.headers
            //verifying the token
            const decoded = jwt.verify(token, secret);
            //finding user from database and returning it without password(data)
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (err) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

module.exports = { protect };
