import React from "react";
import { Box, Text } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/react";
import "./UserListItem.css";
function UserListItem({ user, handleFunction }) {
    return (
        <div className="chat-box">
            <Avatar
                mr={2}
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
            />
            <Box>
                <Text margin="0%">{user.name}</Text>
                <Text fontSize="xs" margin="0%">
                    <b>Email: </b>
                    {user.email}
                </Text>
            </Box>
        </div>
    );
}

export default UserListItem;
