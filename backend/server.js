const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
app.use(cors());
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

const mongoose = require("mongoose");

async function connectDB() {
    try {
        const connection = await mongoose.connect(
            `mongodb+srv://sriramt234:SRIRAM1234@cluster0.b6ln3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
        );
    } catch (err) {
        console.log(`Error: ${err.message}`.red.bold);
    } finally {
        console.log("connected to mongoDB".green.bold);
    }
}
connectDB();

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
//     );
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//     );
//     next();
// });

// // this is to intercept every request of json type: (body parser)
app.use(express.json());

app.get("/api/chat/:id", (req, res) => {
    // console.log(req.params.id);
    const singleChat = chats.find((chat) => chat._id == req.params.id);
    res.send(singleChat);
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

/*************DEPLOYMENT *************/

const __dirname1 = path.resolve();
// for production:
app.use(express.static(path.join(__dirname1, "/chat-frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(
        path.resolve(__dirname1, "chat-frontend", "build", "index.html")
    );
});

/*************DEPLOYMENT *************/

/***********for page errors */
app.use((req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});
app.use((err, req, res, next) => {
    res.status(res.statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

const server = app.listen("3030", console.log(`this is my server `));

const io = require("socket.io")(server, {
     //ping time out is to close the connection if there is no activity between user for more than a specific period, here: 60sec
    pingTimeout: 60000,
    cors: {
        origin: "https://giribabi-chateasy.vercel.app:*",
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");
    // here we are creating a socket where frontend sends some data to backend
    // and a room is created
    socket.on("setup", (userData) => {
        // a room is created for that particular user
        socket.join(userData._id);
        //console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined: ", room, " room");
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) {
            return console.log("chat.users is not defined");
        }
        //sending a message to all receipient except to the sender himself.
        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return;
            // sending the newMessageRecieved to user._id
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });
    socket.off("setup", () => {
        console.log("user disconnected");
        socket.leave(userData._id);
    });
});
