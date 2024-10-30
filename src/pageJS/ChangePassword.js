import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "../pageCSS/ForgotPassword.css";


const OTPForm = () => {
    const [email, setEmail] = useState('');
    const [votp,setVOTP] = useState('');
    const navigate = useNavigate();
    const URL = "http://localhost:3309";

    const sendOTP = async () => {
        try {
            const response = await axios.post(URL + '/sendOTP', { email });
            Swal.fire({
                title: 'SUCCESS',
                text: 'OTP send successfully!',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                localStorage.setItem('email',email);
            });

        } catch (error) {       
            if (error.response) {
                if (error.response.status === 404) {
                    Swal.fire({
                        title: 'Error',
                        text: "This email doesn't exist",
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                } else if (error.response.data && error.response.data.error) {
                    Swal.fire({
                        title: 'Error',
                        text: "Server Error",
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: error.response.status, // Generic error alert with status
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Error sending OTP: ' + error.message,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }
    };
    
    const verifyOTP = async() => {
        console.log("code : ",votp);
        try {
            const response = await axios.post(URL +'/verifyOTP',{votp});
            Swal.fire({
                title: 'SUCCESS',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                navigate("/resetpassword");
            });

        }catch(error){
            if(error.response){
                if(error.response.status === 404){
                    Swal.fire({
                        title: 'Error',
                        text: "Verification denied",
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }else if(error.response.data && error.response.data.error){
                    Swal.fire({
                        title: 'Error',
                        text: error.response.data.error,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }else{
                    Swal.fire({
                        title: 'Error',
                        text: error.response.status,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            }else{
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }
    };

    return (
<div className="fp-signin-page">
    <div className="fp-signin-box">
        <h2>Change Password</h2>
        
        <div className="fp-username-box">
            <input
                type="email"
                className="fp-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
        </div>

        <button className="fp-signin-button" onClick={sendOTP}>Send OTP</button>
        
        <div className="fp-username-box">
            <input
                type="password"
                className="fp-input"
                value={votp}
                onChange={(e) => setVOTP(e.target.value)}
                placeholder="Enter your OTP"
            />
        </div>

        <button className="fp-signin-button" onClick={verifyOTP}>Verify OTP</button>
    </div>
</div>

    );
};

export default OTPForm;
