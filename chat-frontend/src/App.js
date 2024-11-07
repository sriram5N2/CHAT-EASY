import "./App.css";
import { Routes, Route } from "react-router";
import Home from "./Pages/Home/Home";
import Chats from "./Pages/Chats/Chats";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chats" element={<Chats />} />
            </Routes>
        </div>
    );
}

export default App;
