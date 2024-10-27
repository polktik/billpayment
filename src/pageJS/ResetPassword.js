import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

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
            alert(response.data.message);
            navigate("/");
            localStorage.removeItem('email');

        } catch (error) {
            if (error.response) {
                if (error.response.data && error.response.data.error) {
                    alert(error.response.data.error);
                } else {
                    alert("Error: " + error.response.status);
                }
            } else {
                alert(error.message);
            }
        }
    };

    const checkPasswordMatch = (e) => {
        e.preventDefault();
        if (password === checkPassword) {
            resetPassword(password);
        } else {
            alert("Passwords do not match. Please try again.");
        }
    };

    return (
        <div>
            <form onSubmit={checkPasswordMatch}>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={checkPassword}
                        onChange={(e) => setCheckPassword(e.target.value)}
                        placeholder="Re-enter your password"
                    />
                </div>
                <button type="submit">Proceed</button>
            </form>
        </div>
    );
};

export default ResetPassword;
