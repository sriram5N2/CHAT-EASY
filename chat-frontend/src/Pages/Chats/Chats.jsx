import React, { useContext, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import MyChats from "../../Components/MyChats/MyChats";
import SingleChat from "../../Components/SingleChat/SingleChat";
import { ChatContext } from "../../Context/ChatProvider";
import "./Chats.css";

function Chats() {
    const { user, selectedChat, windowWidth } = useContext(ChatContext);
    const [fetchChatsAgain, setFetchChatsAgain] = useState(false);
    //console.log(chatContext.user);
    return (
        <div className="chats-page">
            {user && <Sidebar />}
            <div className="chats-container">
                {user &&
                    ((windowWidth < 700 && !selectedChat) ||
                        windowWidth >= 700) && (
                        <div className="chats-list">
                            <MyChats fetchChatsAgain={fetchChatsAgain} />
                        </div>
                    )}
                {user &&
                    ((windowWidth < 700 && selectedChat) ||
                        windowWidth >= 700) && (
                        <div className="single-chat">
                            <SingleChat
                                fetchChatsAgain={fetchChatsAgain}
                                setFetchChatsAgain={setFetchChatsAgain}
                            />
                        </div>
                    )}
            </div>
        </div>
    );
}

export default Chats;
