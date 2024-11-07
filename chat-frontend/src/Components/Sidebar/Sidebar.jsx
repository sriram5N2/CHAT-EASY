import React, { useContext, useEffect, useState } from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { Bell } from "react-bootstrap-icons";
import { Avatar, CloseButton } from "@chakra-ui/react";
import { ChatContext } from "../../Context/ChatProvider";
import "./Sidebar.css";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useNavigate } from "react-router";
import { useDisclosure } from "@chakra-ui/hooks";
import ChatLoading from "../ChatLoading/ChatLoading";
import UserListItem from "../UserListItem/UserListItem";
import Loader from "../Loader/Loader";
import axios from "axios";

import {
    Input,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    useToast,
} from "@chakra-ui/react";

function Sidebar() {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const [showModal, setShowModal] = useState(false);
    //const [selectedChat, setSelectedChat] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        user,
        setSelectedChat,
        chats,
        setChats,
        notifications,
        setNotifications,
    } = useContext(ChatContext);

    const navigate = useNavigate();
    // console.log(user);
    const handleLogOut = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    const toast = useToast();

    const accessChat = async (userId) => {
        ///console.log("entered");
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    // we use "content-type" here as we send json data through our request
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                "https://giribabi-chateasy2024-api.onrender.com/api/chat",
                { userId },
                config
            );
            // if the selected chat is not in the chat list, then append it to the user's chat list.
            if (!chats.find((c) => c._id === data._id))
                setChats([data, ...chats]);
            setSelectedChat(data);
            //console.log(data);
            //close side drawer after a chat is selected
            onClose();
        } catch (error) {
            console.log(error);
            toast({
                title: "Error in showing selected chat",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoadingChat(false);
        }
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Enter a valid username or mail",
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
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(
                `https://giribabi-chateasy2024-api.onrender.com/api/user?search=${search}`,
                config
            );
            //console.log("fetched data:");
            if (data.length === 0)
                setSearchResult({ message: "No such users" });
            else setSearchResult(data);
            //console.log(data);
        } catch (error) {
            console.log(error);
            toast({
                title: "Failed to load searched user",
                status: "error",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
            //console.log("fetching user completed");
        }
    };

    return (
        <div className="sidebar-container">
            <div className="search-button-container">
                <OverlayTrigger
                    delay={{ hide: 350, show: 300 }}
                    overlay={(props) => (
                        <Tooltip {...props}>Search Users to chat</Tooltip>
                    )}
                    placement="bottom"
                >
                    <Button variant="outline-secondary" onClick={onOpen}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-search"
                            viewBox="0 0 16 16"
                            style={{ marginRight: " 3px", display: "inline" }}
                        >
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>
                        <span className="search-button">Search Users</span>
                    </Button>
                </OverlayTrigger>
            </div>
            <div className="heading">ChatEasy</div>
            <div className="menus">
                <div className="notifications-menu">
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary">
                            <Bell style={{ display: "inline" }} />
                            <span
                                style={{
                                    color: "#03C04A",
                                    borderRadius: "5em",
                                    fontWeight: "700",
                                    padding: "0% 5%",
                                    margin: "5%",
                                }}
                            >
                                {notifications.length === 0
                                    ? "-"
                                    : `${notifications.length}`}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {!notifications.length && (
                                <Dropdown.Item>No new messages</Dropdown.Item>
                            )}
                            {notifications.length > 0 && (
                                <div className="notifications">
                                    {notifications.map(
                                        (notification, index) => (
                                            <Dropdown.Item
                                                key={
                                                    notification._id +
                                                    `${index}`
                                                }
                                                onClick={() => {
                                                    setSelectedChat(
                                                        notification.chat
                                                    );
                                                    setNotifications(
                                                        notifications.filter(
                                                            (notif) =>
                                                                notif !==
                                                                notification
                                                        )
                                                    );
                                                }}
                                            >
                                                {notification.chat.isGroupChat
                                                    ? `${notification.chat.chatName}`
                                                    : notification.chat.users[0]
                                                          ._id === user._id
                                                    ? notification.chat.users[1]
                                                          .name
                                                    : notification.chat.users[0]
                                                          .name}
                                            </Dropdown.Item>
                                        )
                                    )}
                                </div>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="profile-menu">
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="outline-info"
                            style={{ padding: "4% 3%" }}
                        >
                            <Avatar
                                mr={2}
                                size="sm"
                                cursor="pointer"
                                //name={user.name}
                                src={user.pic}
                            />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <ProfileModal
                                show={showModal}
                                setShow={setShowModal}
                                info={user}
                            >
                                <Dropdown.Item
                                    onClick={() => setShowModal(!showModal)}
                                >
                                    My Profile
                                </Dropdown.Item>
                            </ProfileModal>
                            <Dropdown.Item onClick={handleLogOut}>
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader>
                        <div className="drawer-header">
                            Search Users
                            <CloseButton onClick={onClose} />
                        </div>
                    </DrawerHeader>
                    <DrawerBody>
                        <div
                            className="user-search-container"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            <Input
                                mr={2}
                                type="text"
                                placeholder="Search by name or email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </div>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult &&
                            !searchResult.message &&
                            searchResult?.map((user, index) => (
                                <div
                                    onClick={() => accessChat(user._id)}
                                    key={`${index}` + user._id}
                                >
                                    <UserListItem key={user._id} user={user} />
                                </div>
                            ))
                        )}
                        {!loading && searchResult.message && "No such users"}
                        {loadingChat && <Loader />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default Sidebar;
