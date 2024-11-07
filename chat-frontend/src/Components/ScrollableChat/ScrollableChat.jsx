import React, { useContext } from "react";
import { ChatContext } from "../../Context/ChatProvider";
import { Tooltip, Avatar } from "@chakra-ui/react";

function ScrollableChat({ messages }) {
    const { user } = useContext(ChatContext);

    const isLastSenderMessage = (messages, ind, userId) => {
        return (
            (ind < messages.length - 1 &&
                messages[ind].sender._id !== userId &&
                messages[ind + 1].sender._id === userId) ||
            (ind === messages.length - 1 && messages[ind].sender._id !== userId)
        );
    };

    // I have written 3 functions into one single simpler function which would be used to align positions and avatar display of sender messages.

    return (
        <div style={{ height: "68vh", overflowY: "auto" }}>
            {messages &&
                messages.map((m, index) => (
                    <div
                        className="message"
                        style={{
                            width: "96%",
                            display: "flex",
                            justifyContent:
                                m.sender._id === user._id
                                    ? "flex-end"
                                    : "flex-start",
                            margin: "0.5em",
                        }}
                        key={`${index}` + m.sender._id}
                    >
                        <div
                            className=""
                            style={{ display: "flex" }}
                            key={m._id}
                        >
                            <Tooltip
                                label={m.sender.name}
                                placement="bottom-start"
                                hasArrow
                            >
                                <Avatar
                                    style={{
                                        opacity: isLastSenderMessage(
                                            messages,
                                            index,
                                            user._id
                                        )
                                            ? "1"
                                            : "0",
                                    }}
                                    m={2}
                                    size="sm"
                                    cursor="pointer"
                                    name={m.sender.name}
                                    src={m.sender.pic}
                                />
                            </Tooltip>
                            <span
                                style={{
                                    backgroundColor:
                                        m.sender._id === user._id
                                            ? "lightgreen"
                                            : "lightblue",
                                    borderRadius: "18px",
                                    padding: "10px",
                                }}
                            >
                                {m.content}
                            </span>
                        </div>
                    </div>
                ))}
        </div>
    );
}

export default ScrollableChat;
