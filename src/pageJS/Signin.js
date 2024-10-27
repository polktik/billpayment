import React from "react";
import { useNavigate } from "react-router-dom";
import "../pageCSS/Signin.css";
import axios from 'axios';
import Swal from 'sweetalert2'
import { useState } from "react";

export default function Signin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3309/login', { username, password });
            setMessage(response.data.message);
            if (response.data.success) {
                Swal.fire({
                    title: 'SUCCESS',
                    text: 'Sign in successfully!',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    navigate("/home");
                });
            } else {
                Swal.fire({
                    title: 'UNSUCCESS!',
                    html: 'Invalid username or password!!<br/> Please try again.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    navigate("/signin");
                    window.location.reload();
                });
                // alert("Username or Password does not match please try again!!");
            }


        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                Swal.fire({
                    title: 'Unsuccess!',
                    html: 'Invalid username or password!!<br/> Please try again.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    navigate("/signin");
                    window.location.reload();
                });
            } else {
                alert('An error occurred. Please try again later.');
            }
        }
    };

    const handleForgotPassword = () => {
        navigate("/forgot");
    };

    return (<div className="sig-signin-page">
        <div className="sig-signin-box">
            <h2>Sign in</h2>
            <form onSubmit={handleLogin}>
                <div className="sig-username-box">
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="sig-password-box">
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="sig-forgot-password">
                    <a onClick={handleForgotPassword}>Forgot Password?</a>
                </div>
                <button type="submit" className="sig-signin-button">Sign in</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    </div>
    );
}