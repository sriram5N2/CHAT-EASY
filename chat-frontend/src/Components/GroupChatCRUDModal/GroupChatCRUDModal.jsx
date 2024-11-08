import { useDisclosure, Button, useToast } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import Loader from "../Loader/Loader";
import { ChatContext } from "../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../UserListItem/UserListItem";

function GroupChatCRUDModal({ children }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [searchedResult, setSearchedResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { user, chats, setChats } = useContext(ChatContext);
    const [selectedUsers, setSelectedUsers] = useState([user]);
    const [userToken, setUserToken] = useState(user ? user.token : null);

    //console.log(selectedUsers);
    useEffect(() => {
        if (user) {
            setUserToken(user.token);
        }
    }, [userToken, user]);

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
    const handleNewGroupDetails = async () => {
        //if empty groupname or no users selected
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: "5000",
                isClosable: true,
                position: "top",
            });
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            const { data } = await axios.post(
                "https://chat-easy-suct.onrender.com/api/chat/creategroup",
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            //console.log(data);
            setChats([data, ...chats]);
            onClose();
        } catch (error) {
            console.log(error);
            toast({
                title: "Failed to create group chat",
                description: error.response.data,
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "top",
            });
        } finally {
            toast({
                title: "Group Chat created successfully",
                status: "success",
                duration: "5000",
                isClosable: true,
                position: "top",
            });
        }
    };

    const handleGroupJoinerDelete = (userToBeDeleted) => {
        setSelectedUsers(
            selectedUsers.filter((u) => u._id !== userToBeDeleted._id)
        );
    };

    const handleGroup = (userToBeAdded) => {
        if (selectedUsers.includes(userToBeAdded)) {
            toast({
                title: "Already added the user",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, userToBeAdded]);
    };

    return (
        <div>
            <span onClick={onOpen}>{children}</span>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        d="flex"
                        justifyContent="center"
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody d="flex" flexDir="column" alignItems="center">
                        <form>
                            <input
                                style={{ margin: "2%" }}
                                placeholder="Enter Chat name"
                                onChange={(e) =>
                                    setGroupChatName(e.target.value)
                                }
                            />
                            <input
                                style={{ margin: "2%" }}
                                placeholder="Add user through search"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </form>
                        {selectedUsers?.map((selectedUser, index) => (
                            // you left here
                            <div
                                className="selected-user-for-group"
                                style={{
                                    display: "inline-block",
                                    color: "white",
                                    margin: "2%",
                                    padding: "1%",
                                }}
                                key={user._id + `${index}`}
                            >
                                <div
                                    className="selected-user-name"
                                    style={{
                                        display: "inline",
                                        backgroundColor: "rgb(0,225,235)",
                                        padding: "4%",
                                        borderRadius: "1em",
                                        borderBottomLeftRadius: "0em",
                                    }}
                                >
                                    {selectedUser.name}
                                </div>
                                <div
                                    style={{
                                        display: "inline",
                                        textAlign: "center",
                                        fontWeight: "600",
                                        color: "red",
                                        padding: "3%",
                                        paddingLeft: "5%",
                                        backgroundColor: "rgb(0,225,235)",
                                        cursor: "pointer",
                                        borderBottomRightRadius: "2em",
                                        borderBottomLeftRadius: "2em",
                                    }}
                                    onClick={() =>
                                        handleGroupJoinerDelete(selectedUser)
                                    }
                                >
                                    {"X"}
                                </div>
                            </div>
                        ))}
                        {loading ? (
                            <Loader />
                        ) : (
                            searchedResult?.slice(0, 4).map((user) => (
                                <div
                                    onClick={() => handleGroup(user)}
                                    key={user._id}
                                >
                                    <UserListItem key={user._id} user={user} />
                                </div>
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            onClick={handleNewGroupDetails}
                        >
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default GroupChatCRUDModal;
