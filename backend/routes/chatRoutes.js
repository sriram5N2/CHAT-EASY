const express = require("express");
const router = express.Router();
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
} = require("../controllers/chatControllers");

// we need this 'protect' module again as only authorised users must be able to access all chats
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/creategroup", protect, createGroupChat);
router.put("/renamegroup", protect, renameGroup);
router.put("/removefromgroup", protect, removeFromGroup);
router.put("/addtogroup", protect, addToGroup);

module.exports = router;
