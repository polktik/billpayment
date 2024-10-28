import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "../pageCSS/Resetpassword.css";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const URL = "http://localhost:3309";

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        setEmail(storedEmail);
        console.log("Stored email :", storedEmail);
    }, []);

    const resetPassword = async (passwordToReset) => {
        try {
            const response = await axios.put(`${URL}/resetPassword`, { email, resetPassword: passwordToReset });
            Swal.fire({
                title: 'SUCCESS',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                navigate("/");
                localStorage.removeItem('email');
            });


        } catch (error) {
            if (error.response) {
                if (error.response.data && error.response.data.error) {
                    Swal.fire({
                        title: 'Error',
                        text: error.response.data.error,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: error.response.status,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }
    };

    const checkPasswordMatch = (e) => {
        e.preventDefault();
        if (password === checkPassword) {
            resetPassword(password);
        } else {
            Swal.fire({
                title: 'Error',
                text: "Passwords do not match. Please try again.",
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    return (
<div className="pc-signin-page">
    <div className="pc-signin-box">
        <h2>Confirm Your Password</h2>
        <form onSubmit={checkPasswordMatch}>
            <div className="pc-password-box">
                <input
                    type="password"
                    className="pc-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
            </div>
            <div className="pc-password-box">
                <input
                    type="password"
                    className="pc-input"
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    placeholder="Re-enter your password"
                />
            </div>
            <button type="submit" className="pc-signin-button">Proceed</button>
        </form>
    </div>
</div>
    );
};

export default ResetPassword;
