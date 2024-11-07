const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        console.log("UserId param not sent along with request");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {
                users: { $elemMatch: { $eq: req.user._id } },
            },
            {
                users: { $elemMatch: { $eq: userId } },
            },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");
    //the above populate method is to filter output
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });
    if (isChat.lenght > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.find({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
    try {
        //fetching all chats in which the current logged user is a part of
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            //after populating data, sort the chats according to recently recieved or sent messages.
            .sort({ updatedAt: -1 })
            .then(async (chats) => {
                chats = await User.populate(chats, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
                res.status(200).send(chats);
            });
    } catch (error) {
        console.log(error);
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({
            message: "Please fill all the fields",
        });
    }
    // the stringified request.body.users is being parsed
    var users = JSON.parse(req.body.users);
    if (users.length < 2) {
        return res
            .status(400)
            .send("More than two users required to form a group chat");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
            // or just chatName,
        },
        {
            //sets update=true, else not updation is done
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat not found");
    } else {
        res.json(updatedChat);
    }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!added) {
        res.status(404);
        throw new Error("chat not found");
    } else {
        res.json(added);
    }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!removed) {
        res.status(404);
        throw new Error("chat not found");
    } else {
        res.json(removed);
    }
});

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
};
