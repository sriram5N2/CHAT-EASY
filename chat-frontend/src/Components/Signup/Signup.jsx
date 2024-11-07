import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import Loader from "../Loader/Loader";
import { ChatContext } from "../../Context/ChatProvider";

// add loader while image is uploading and while sending data to backend

function Signup() {
    const { setUser } = useContext(ChatContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [pic, setPic] = useState();
    const [picLoading, setPicLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();
    const handleClick = () => setShowPassword(!showPassword);

    const postPic = (pic) => {
        setPicLoading(true);
        if (pic === undefined) {
            toast({
                title: "Select an image",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
            setPicLoading(false);
            return;
        }
        if (pic.type === "image/jpeg" || pic.type === "image/png") {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", "chateasy-app");
            data.append("cloud_name", "giribabi");
            fetch("https://api.cloudinary.com/v1_1/giribabi/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    //console.log(data.url.toString());
                    console.log("image upload completed");
                    setPicLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    toast({
                        title: "Error in uploading image",
                        status: "error",
                        duration: "5000",
                        isClosable: true,
                        position: "top-left",
                    });
                    setPicLoading(false);
                });
        } else {
            toast({
                title: "Select an image",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
            setPicLoading(false);
        }
    };

    const handleSubmit = async () => {
        //console.log("pic:", pic);
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: "Enter all the fields",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        }
        if (password !== confirmPassword) {
            toast({
                title: "Check your password",
                status: "warning",
                duration: "5500",
                isClosable: true,
                position: "top-left",
            });
        }
        try {
            setLoading(true);
            const config = {
                header: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                " https://giribabi-chateasy2024-api.onrender.com/api/user",
                {
                    name,
                    email,
                    password,
                    pic,
                },
                config
            );
            toast({
                title: "Successfully registered",
                status: "success",
                duration: "5000",
                isClosable: true,
                position: "top-left",
            });
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            navigate("/chats");
        } catch (err) {
            toast({
                title: "Error in registration",
                description: err.response.data.message,
                status: "warning",
                duration: "5500",
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
                <VStack spacing="5px">
                    <FormControl id="first-name" isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                            placeholder="Enter Your Name"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                    <FormControl id="email" isRequired>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                            type="email"
                            placeholder="Enter Your Email Address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormControl>
                    <FormControl id="password" isRequired>
                        <FormLabel>Password</FormLabel>
                        <InputGroup size="md">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                onChange={(e) => setPassword(e.target.value)}
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
                    <FormControl isRequired>
                        <FormLabel>Confirm Password</FormLabel>
                        <InputGroup size="md">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
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
                    <FormControl id="pic">
                        <FormLabel>Upload your Picture</FormLabel>
                        <Input
                            type="file"
                            p={1.5}
                            accept="image/*"
                            onChange={(e) => postPic(e.target.files[0])}
                        />
                    </FormControl>
                    <Button
                        colorScheme="blue"
                        width="80%"
                        style={{ marginTop: 15 }}
                        onClick={handleSubmit}
                        isLoading={picLoading}
                    >
                        Sign Up
                    </Button>
                </VStack>
            )}
        </div>
    );
}

export default Signup;
