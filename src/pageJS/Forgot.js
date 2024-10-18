import React, { useState } from 'react';
import axios from 'axios';

const OTPForm = () => {
    const [email, setEmail] = useState('');

    const sendOTP = async () => {
        try {
            const response = await axios.post('http://localhost:3309/sendOTP', { email });
            alert(response.data.message);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert("This email doesn't Exist");
            } else {
                alert('Error sending OTP: ' + error.message);
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
        </div>
    );
};

export default OTPForm;
