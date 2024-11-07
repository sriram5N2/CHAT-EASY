const express = require("express");
const router = express.Router();

const {
    sendMessage,
    allMessages,
} = require("../controllers/messageControllers");

// we need this 'protect' module again as only authorised users must be able to access all chats
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, allMessages);

module.exports = router;
