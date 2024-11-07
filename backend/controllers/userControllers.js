const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Enter all the fields");
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User exists");
    }
    const user = await User.create({
        name,
        email,
        password,
        pic,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Failed to create user");
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Check your login email and password");
    }
});

// /api/user?search=userName
const allUsers = asyncHandler(async (req, res) => {
    //for /:id , we write req.params
    //for ?search=some_random_query , we write req.query
    // res.send("response");

    //check if there is any query "req.query.search ?" (just like react.js {condition?true:false})
    const keyword = req.query.search
        ? {
              // $or operator in mongodb performs logical OR operation between all elements in an array(here) or any elements
              // here we are checking either is search is through name or email
              $or: [
                  { name: { $regex: req.query.search, $options: "i" } },
                  { email: { $regex: req.query.search, $options: "i" } },
              ],
              // $options: "i" means case sensitive query
              // $regex in mongodb is used for string pattern matching
          }
        : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
    // return all users except currently logged in user
});

module.exports = { registerUser, authUser, allUsers };
