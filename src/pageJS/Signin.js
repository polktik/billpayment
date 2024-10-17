import React from "react";
import { useNavigate } from "react-router-dom";
import "../pageCSS/Signin.css";
import axios from 'axios';
import { useState } from "react";

export default function Signin() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] =useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    const handleLogin = async(event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3309/register', { firstname, lastname, username, password, email });
            setMessage(response.data.message);
            navigate("/home");

    } catch (error) {
        if (error.response) {
            setMessage(error.response.data.message);
        } else {
            setMessage('An error occurred. Please try again later.');
        }
    }
};

return (<div className="sig-signin-page">
    <div className="sig-signin-box">
        <h2>Sign in</h2>
        <form onSubmit={handleLogin}>
            <div className="sig-username-box">
                <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
            </div>
            <div className="sig-password-box">
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            <div className="sig-forgot-password">
                <a href="/forgot">Forgot Password?</a>
            </div>
            <button type="submit" className="sig-signin-button">Sign in</button>
            {message && <p>{message}</p>} {/* แสดงข้อความแจ้งเตือน */}
        </form>
    </div>
</div>
);
}