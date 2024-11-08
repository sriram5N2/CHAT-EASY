import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, useToast } from "@chakra-ui/react";
import Loader from "../Loader/Loader";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { ChatContext } from "../../Context/ChatProvider";

function Login() {
    const { setUser } = useContext(ChatContext);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const handleClick = () => setShowPassword(!showPassword);
    const handleSubmit = async () => {
        if (!email || !password) {
            toast({
                title: "Please fill all the credentials",
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
                header: {
                    "Content-type": "application/json",
                },
            };
            const { data } = await axios.post(
                "https://chat-easy-suct.onrender.com/api/user/login",
                {
                    email,
                    password,
                },
                config
            );
            toast({
                title: "Login successful",
                status: "success",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            navigate("/chats");
        } catch (err) {
            toast({
                title: "Error occured, check your credentials",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "top-left",
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="login-box">
            {loading ? (
                <Loader />
            ) : (
                <VStack spacing="10px">
                    <FormControl id="email" isRequired>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                            value={email}
                            type="email"
                            placeholder="Enter Your Email Address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormControl>
                    <FormControl id="password" isRequired>
                        <FormLabel>Password</FormLabel>
                        <InputGroup size="md">
                            <Input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                            />
                            <InputRightElement width="4.5rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={handleClick}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    <Button
                        colorScheme="blue"
                        width="80%"
                        style={{ marginTop: 15 }}
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        Login
                    </Button>
                </VStack>
            )}
        </div>
    );
}

export default Login;
