const chats = [
    {
        isGroupChat: false,
        users: [
            {
                name: "User1",
                email: "user1@gmail.com",
            },
            {
                name: "User1",
                email: "user1@gmail.com",
            },
        ],
        _id: "id1",
        chatName: "GroupChat",
    },
    {
        isGroupChat: true,
        users: [
            {
                name: "User2",
                email: "user2@gmail.com",
            },
            {
                name: "User3",
                email: "user3@gmail.com",
            },
        ],
        _id: "id2",
        chatName: "UserChat",
    },
];

module.exports = { chats };
