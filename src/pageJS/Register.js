import React from "react";
import { useNavigate } from "react-router-dom";
import "../pageCSS/Register.css";
import axios from 'axios';
import { useState } from "react";

export default function Register() {
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

return (<div className="reg-register-page">
    <div className="reg-register-box">
        <h2>Register</h2>
        <form onSubmit={handleLogin}>
            <div className="reg-firstname-box">
                <input type="text" placeholder="Firstname" value={firstname} onChange={(e)=>setFirstname(e.target.value)} required />
            </div>
            <div className="reg-lastname-box">
                <input type="text" placeholder="Lastname" value={lastname} onChange={(e)=>setLastname(e.target.value)} required />
            </div>
            <div className="reg-username-box">
                <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
            </div>
            <div className="reg-password-box">
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            <div className="reg-email-box">
                <input type="text" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div className="reg-forgot-password">
                <a href="/forgot">Forgot Password?</a>
            </div>
            <button type="submit" className="reg-register-button">Register</button>
            {message && <p>{message}</p>} {/* แสดงข้อความแจ้งเตือน */}
        </form>
    </div>
</div>
);
}