import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./Home.css";
import Signup from "../../Components/Signup/Signup";
import Login from "../../Components/Login/Login";

function Home() {
    const navigate = useNavigate();
    const [loginPage, setLoginPage] = useState(false);
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        //console.log(user);
        if (user) {
            navigate("/chats");
        }
    }, [navigate]);
    return (
        <div className="home-container">
            {/* <div className="home-page-heading">CHATEASY</div> */}
            <div className="login-signup-container">
                <div className="login-signup-headings">
                    <div
                        className="login-heading"
                        onClick={() => setLoginPage(true)}
                        style={{
                            backgroundColor: loginPage
                                ? "rgb(81, 81, 242)"
                                : "transparent",
                            color: loginPage ? "white" : "black",
                        }}
                    >
                        Login
                    </div>
                    <div
                        className="signup-heading"
                        onClick={() => setLoginPage(false)}
                        style={{
                            backgroundColor: !loginPage
                                ? "rgb(81, 81, 242)"
                                : "transparent",
                            color: !loginPage ? "white" : "black",
                        }}
                    >
                        Signup
                    </div>
                </div>
                <div className="login-signup-components">
                    {loginPage ? <Login /> : <Signup />}
                </div>
            </div>
        </div>
    );
}
export default Home;
