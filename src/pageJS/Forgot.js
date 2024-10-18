import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const OTPForm = () => {
    const [email, setEmail] = useState('');
    const [votp,setVOTP] = useState('');
    const navigate = useNavigate();
    const URL = "http://localhost:3309";

    const sendOTP = async () => {
        try {
            const response = await axios.post(URL + '/sendOTP', { email });
            localStorage.setItem('email',email);

            alert(response.data.message);
        } catch (error) {       
            if (error.response) {
                if (error.response.status === 404) {
                    alert("This email doesn't exist"); // Alert if email not found
                } else if (error.response.data && error.response.data.error) {
                    alert(error.response.data.error); // Alert the error message from server
                } else {
                    alert('Error: ' + error.response.status); // Generic error alert with status
                }
            } else {
                alert('Error sending OTP: ' + error.message);
            }
        }
    };
    
    const verifyOTP = async() => {
        console.log("code : ",votp);
        try {
            const response = await axios.post(URL +'/verifyOTP',{votp});
            alert(response.data.message);
            navigate("/resetpassword");
        }catch(error){
            if(error.response){
                if(error.response.status === 404){
                    alert("Verification denied");
                }else if(error.response.data && error.response.data.error){
                    alert(error.response.data.error);
                }else{
                    alert('Error: ' + error.response.status);
                }
            }else{
                alert('Error :' + error.message);
            }
        }
    };

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
            <button onClick={sendOTP}>Send OTP</button>
            <input
                type="password"
                value={votp}
                onChange={(e) => setVOTP(e.target.value)}
                placeholder="Enter your email"
            />
            <button onClick={verifyOTP}>Verify OTP</button>
            
        </div>
    );
};

export default OTPForm;
