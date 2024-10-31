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
        const lowercaseEmail = email.toLowerCase();

        try {
            const response = await axios.post('http://localhost:3309/register', { firstname, lastname, username, password, email:lowercaseEmail });
            setMessage(response.data.message);
            if(response.data.success){
                navigate("/");
            }else{
                alert("username or Email already exists. please try again")
            }


    } catch (error) {
        if (error.response) {
            setMessage(error.response.data.message);
        } else {
            setMessage('An error occurred. Please try again later.');
        }
    }
};

return (<div className="register-page">
    <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleLogin}>
            <div className="firstname-box">
                <input type="text" placeholder="Firstname" value={firstname} onChange={(e)=>setFirstname(e.target.value)} required />
            </div>
            <div className="lastname-box">
                <input type="text" placeholder="Lastname" value={lastname} onChange={(e)=>setLastname(e.target.value)} required />
            </div>
            <div className="username-box">
                <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
            </div>
            <div className="reg-password-box">
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            <div className="email-box">
                <input type="text" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="register-button">Register</button>
            {message && <p>{message}</p>} {/* แสดงข้อความแจ้งเตือน */}
        </form>
    </div>
</div>
);
}