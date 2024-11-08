import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../Context/ChatProvider";
import { ArrowLeft } from "react-bootstrap-icons";
import ProfileModal from "../ProfileModal/ProfileModal";
import UpdateGroupChatModal from "../UpdateGroupChatModal/UpdateGroupChatModal";
import { PersonCircle } from "react-bootstrap-icons";
import Loader from "../Loader/Loader";
import { FormControl, Input, useToast } from "@chakra-ui/react";
import axios from "axios";
import ScrollableChat from "../ScrollableChat/ScrollableChat";
import Lottie from "react-lottie";

import io from "socket.io-client";
import animationData from "../animations/typing.json";

const ENDPOINT = "https://giribabi-chateasy2024-api.onrender.com/";

var socket, selectedChatCompare;

function SingleChat({ fetchChatsAgain, setFetchChatsAgain }) {
    const {
        user,
        selectedChat,
        setSelectedChat,
        notifications,
        setNotifications,
        windowWidth,
    } = useContext(ChatContext);
    const [showModal, setShowModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    const [userToken, setUserToken] = useState(user ? user.token : null);

    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const [socketConnected, setSocketConnected] = useState(false);

    // we kept this useEffect to initialize the socket before using it in other sockets.
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => {
            setSocketConnected(true);
        });
        socket.on("typing", () => setTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toast = useToast();
    useEffect(() => {
        if (user) {
            setUserToken(user.token);
        }
    }, [userToken, user]);

    const singleChatContainerStyles = {
        backgroundColor: "white",
        width: windowWidth < 700 ? "95vw" : "62vw",
        height: "89vh",
        borderRadius: "1em",
        margin: "1% 3%",
        marginBottom: "0%",
    };
    const chatNotSelectedStyles = {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "180%",
    };
    const selectedChatStyles = {
        textAlign: "center",
        height: "100%",
    };

    const fetchMessages = async () => {
        if (!selectedChat || !selectedChat._id) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            const { data } = await axios.get(
                `https://chat-easy-suct.onrender.com/api/message/${selectedChat._id}`,
                config
            );
            //console.log(data);
            setMessages(data);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            console.log(error);
            toast({
                title: "Oops! error occured",
                description: "Failed to load messages",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            selectedChatCompare = selectedChat;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            // this condition is to avoid the situation when the sender is sending us a message, but he/she is not the current selected chat.
            if (
                !selectedChatCompare ||
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                // give notification
                console.log("entered notifications");
                if (!notifications.includes(newMessageRecieved)) {
                    setNotifications([newMessageRecieved, ...notifications]);
                    setFetchChatsAgain(!fetchChatsAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });
    // no dependency array for this useEffect because we want to execute it on every render.

    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            e.target.value = "";
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                    },
                };
                const { data } = await axios.post(
                    "https://chat-easy-suct.onrender.com/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                //console.log(data);
                console.log("notifications array:", notifications);
                setNewMessage("");
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                console.log(error);
                toast({
                    title: "Oops! error occured",
                    description: "Failed to send message",
                    status: "error",
                    duration: "5500",
                    isClosable: true,
                    position: "top-left",
                });
            }
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        //typing indication
        if (!socketConnected) {
            return;
        }
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        //debouncing or throttling
        let lastTypingTime = new Date().getTime();
        var timeOutLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timeOutLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timeOutLength);
    };

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        renderSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    return (
        <div className="singlechat-container" style={singleChatContainerStyles}>
            {!selectedChat ? (
                <div
                    className="chat-not-selected"
                    style={chatNotSelectedStyles}
                >
                    Select a chat to start chatting
                </div>
            ) : (
                <div className="selectedchat" style={selectedChatStyles}>
                    <div
                        className="singlechat-heading"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                        }}
                    >
                        <ArrowLeft
                            style={{
                                backgroundColor: "white",
                                padding: "1%",
                                borderRadius: "5em",
                                margin: "1%",
                            }}
                            size={36}
                            cursor="pointer"
                            onClick={() => {
                                setSelectedChat("");
                            }}
                        />
                        {selectedChat && selectedChat.users && (
                            <div
                                className="heading-content"
                                style={{ width: "100%", textAlign: "start" }}
                            >
                                {selectedChat.isGroupChat
                                    ? selectedChat.chatName.toUpperCase()
                                    : selectedChat.users[0]._id === user._id
                                    ? selectedChat.users[1].name
                                    : selectedChat.users[0].name}
                            </div>
                        )}
                        {selectedChat && selectedChat.users && (
                            <div
                                className="view-other-user-profile"
                                style={{ margin: "0% 3%" }}
                            >
                                {!selectedChat.isGroupChat ? (
                                    <ProfileModal
                                        show={showModal}
                                        setShow={setShowModal}
                                        info={
                                            selectedChat.users[0]._id ===
                                            user._id
                                                ? selectedChat.users[1]
                                                : selectedChat.users[0]
                                        }
                                    >
                                        <PersonCircle
                                            color="lightblue"
                                            size={30}
                                            onClick={() =>
                                                setShowModal(!showModal)
                                            }
                                            cursor="pointer"
                                        />
                                    </ProfileModal>
                                ) : (
                                    <div>
                                        <PersonCircle
                                            color="lightblue"
                                            size={30}
                                            onClick={() =>
                                                setShowGroupModal(!showModal)
                                            }
                                            cursor="pointer"
                                        />
                                        <UpdateGroupChatModal
                                            show={showGroupModal}
                                            setShow={setShowGroupModal}
                                            fetchChatsAgain={fetchChatsAgain}
                                            setFetchChatsAgain={
                                                setFetchChatsAgain
                                            }
                                            fetchMessages={fetchMessages}
                                        ></UpdateGroupChatModal>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div
                        style={{ backgroundColor: "lightgray", height: "80%" }}
                        className="singlechat-content-container"
                    >
                        {loading ? (
                            <Loader />
                        ) : (
                            <div className="single-chat-content">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                    </div>
                    <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                        {isTyping ? (
                            <div>
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div>
                        ) : (
                            ""
                        )}
                        <Input
                            variant="filled"
                            bg="whitesmoke"
                            placeholder="Type a message"
                            onChange={handleTyping}
                            mx={1}
                            width="90%"
                        />
                    </FormControl>
                </div>
            )}
        </div>
    );
}

export default SingleChat;
