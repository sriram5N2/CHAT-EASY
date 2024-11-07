import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../Context/ChatProvider";
import { useToast, Button } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/layout";
import { Plus } from "react-bootstrap-icons";
import { Stack } from "@chakra-ui/layout";
import axios from "axios";
import GroupChatCRUDModal from "../GroupChatCRUDModal/GroupChatCRUDModal";
import Loader from "../Loader/Loader";

function MyChats({ fetchChatsAgain }) {
    // eslint-disable-next-line no-unused-vars
    const [loggedUser, setLoggerUser] = useState();
    const [loading, setLoading] = useState(false);
    const {
        user,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        windowWidth,
    } = useContext(ChatContext);
    const toast = useToast();
    // check whether the 'user' object is available or not before accessing 'user.token'
    const userToken = user ? user.token : null;
    const fetchChats = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            const { data } = await axios.get(
                "https://giribabi-chateasy2024-api.onrender.com/api/chat",
                config
            );
            //console.log("chats:");
            // console.log(data);
            setChats(data);
            //console.log(data);
        } catch (error) {
            console.log(error);
            toast({
                title: "Error in fetching all your chats",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoggerUser(JSON.parse(localStorage.getItem("userInfo")));
        if (user && user.token) {
            fetchChats();
        }
        // added 'user' object in the dependency array so that use effect is executed after change in user object.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, chats.length, fetchChatsAgain]);

    return (
        <div>
            <Box
                display={selectedChat ? "flex" : "flex"}
                flexDir="column"
                alignItems="center"
                p={3}
                ml={2}
                bg="white"
                w={windowWidth < 700 ? "95vw" : "35vw"}
                h="89vh"
                borderRadius="lg"
                borderWidth="1px"
                marginTop={3}
            >
                <Box
                    pb={3}
                    px={3}
                    fontSize={{ base: "28px", md: "30px" }}
                    fontFamily="Work sans"
                    d="flex"
                    w="100%"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    My Chats
                    <GroupChatCRUDModal>
                        <Button
                            d="flex"
                            fontSize={{ base: "12px", md: "10px", lg: "17px" }}
                            rightIcon={<Plus />}
                            my={2}
                        >
                            New Group Chat
                        </Button>
                    </GroupChatCRUDModal>
                </Box>
                <Box
                    d="flex"
                    flexDir="column"
                    p={3}
                    bg="gray"
                    w="100%"
                    h="100%"
                    borderRadius="lg"
                    overflowY="hidden"
                >
                    {!loading && chats ? (
                        <Stack overflowY="scroll">
                            {chats &&
                                chats.map((chat, index) => (
                                    <Box
                                        onClick={() => setSelectedChat(chat)}
                                        cursor="pointer"
                                        bg={
                                            selectedChat === chat
                                                ? "cyan"
                                                : "lightgray"
                                        }
                                        color={
                                            selectedChat === chat
                                                ? "white"
                                                : "black"
                                        }
                                        px={3}
                                        py={2}
                                        mx={2}
                                        borderRadius="lg"
                                        key={`${index}` + chat._id}
                                    >
                                        {chat.users && (
                                            <Text>
                                                {chat.isGroupChat
                                                    ? chat.chatName
                                                    : chat.users[0]._id ===
                                                      user._id
                                                    ? chat.users[1].name
                                                    : chat.users[0].name}
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                        </Stack>
                    ) : (
                        <Loader />
                    )}
                </Box>
            </Box>
        </div>
    );
}

export default MyChats;
