import React, { useContext, useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Loader from "../Loader/Loader";
import { ChatContext } from "../../Context/ChatProvider";
import { useToast } from "@chakra-ui/react";
import { FormControl, Input } from "@chakra-ui/react";
import axios from "axios";
import UserListItem from "../UserListItem/UserListItem";

function UpdateGroupChatModal({
    show,
    setShow,
    fetchChatsAgain,
    setFetchChatsAgain,
    fetchMessages,
    children,
}) {
    const { selectedChat, setSelectedChat, user } = useContext(ChatContext);

    const [groupChatName, setGroupChatName] = useState("");
    const [searchedResult, setSearchedResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userToken, setUserToken] = useState(user ? user.token : null);

    useEffect(() => {
        if (user) {
            setUserToken(user.token);
        }
    }, [userToken, user]);

    const toast = useToast();

    const handleChatName = async () => {
        if (!groupChatName) {
            toast({
                title: "Chat name must not be empty",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };

            const { data } = await axios.put(
                "https://chat-easy-suct.onrender.com/api/chat/renameGroup",
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                },
                config
            );
            setSelectedChat(data);
            setFetchChatsAgain(!fetchChatsAgain);
        } catch (error) {
            //console.log(error);
            toast({
                title: "Not able to update chat",
                status: "error",
                duration: "5500",
                isClosable: true,
                position: "top",
            });
        } finally {
            setLoading(false);
        }
        setGroupChatName("");
    };

    const handleSearch = async (query) => {
        if (!query || !user) {
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
                `https://chat-easy-suct.onrender.com/api/user?search=${query}`,
                config
            );
            //console.log(data);
            setSearchedResult(data);
        } catch (error) {
            console.log(error);
            toast({
                title: "Failed to search user",
                status: "error",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (userToBeAdded) => {
        if (selectedChat.users.find((u) => u._id === userToBeAdded._id)) {
            toast({
                title: "Already added the user",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top",
            });
            return;
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add users",
                status: "error",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            // eslint-disable-next-line no-unused-vars
            const { data } = await axios.put(
                "https://chat-easy-suct.onrender.com/api/chat/addToGroup",
                {
                    chatId: selectedChat._id,
                    userId: userToBeAdded._id,
                },
                config
            );
        } catch (error) {
            //console.log(error);
            toast({
                title: "User already added",
                status: "error",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
            setSelectedChat(selectedChat);
            setFetchChatsAgain(!fetchChatsAgain);
        }
    };

    const handleExitGroup = async (userToBeRemoved) => {
        // console.log("entered");
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can remove users",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            const { data } = await axios.put(
                "https://chat-easy-suct.onrender.com/api/chat/removeFromGroup",
                {
                    chatId: selectedChat._id,
                    userId: userToBeRemoved._id,
                },
                config
            );
            userToBeRemoved._id === user._id
                ? setSelectedChat()
                : setSelectedChat(data);

            setSelectedChat(selectedChat);
            setFetchChatsAgain(!fetchChatsAgain);
            fetchMessages();
        } catch (error) {
            //console.log(error);
            toast({
                title: "Error in removing user",
                status: "error",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Modal show={show} size="lg" centered>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>{selectedChat.chatName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="group-participants">
                            {selectedChat.users.map((u, index) => (
                                <div
                                    style={{
                                        width: "30vw",
                                        textAlign: "center",
                                        fontWeight: "600",
                                        color: "white",
                                        padding: "2% 5%",
                                        whiteSpace: "nowrap",
                                        backgroundColor: "rgb(0,225,235)",
                                        cursor: "pointer",
                                        borderRadius: "10px",
                                        margin: "2%",
                                    }}
                                    onClick={() => handleExitGroup(u)}
                                    key={`${index}` + u.name}
                                >
                                    {u.name + " X"}
                                </div>
                            ))}
                        </div>
                        <div className="update-group-form">
                            <FormControl
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                }}
                            >
                                <Input
                                    placeholder="New chat name"
                                    m={1}
                                    value={groupChatName}
                                    onChange={(e) => {
                                        setGroupChatName(e.target.value);
                                    }}
                                />
                                <Button
                                    variant="primary"
                                    style={{ margin: "1%" }}
                                    onClick={handleChatName}
                                >
                                    Update
                                </Button>
                            </FormControl>
                            <FormControl>
                                <Input
                                    placeholder="Add user to group"
                                    my={2}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                />
                            </FormControl>
                            {loading ? (
                                <Loader />
                            ) : (
                                searchedResult?.slice(0, 4).map((u, index) => (
                                    <div
                                        onClick={() => handleAddUser(u)}
                                        key={u._id + `${index}`}
                                    >
                                        <UserListItem key={u._id} user={u} />
                                    </div>
                                ))
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div
                            className="footer-buttons"
                            style={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "space-around",
                            }}
                        >
                            <Button
                                variant="danger"
                                onClick={() => handleExitGroup(user)}
                            >
                                Exit Group
                            </Button>
                            <Button
                                variant="outline-success"
                                onClick={() => setShow(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        </div>
    );
}

export default UpdateGroupChatModal;
