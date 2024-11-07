const express = require("express");
const {
    registerUser,
    authUser,
    allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//router.get("/", protect);
//now before showing all users, the 'protect' middleware must be executed
router.get("/", protect, allUsers);
router.post("/", registerUser);
router.post("/login", authUser);

module.exports = router;
