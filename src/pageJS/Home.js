import React, { useEffect,useState } from "react";
import "../pageCSS/Home.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [protectedData, setProtectedData] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const goAddbill = () => {
        navigate("/addbill");
    }

    const goRemovebill = () => {
        navigate("/removebill");
    }

    const goUpdatebill = () => {
        navigate("/updatebill");
    }

    useEffect(() => {
        const fetchProtectedData = async () => {
            const token = localStorage.getItem('token');
            console.log("token",token);
            try {
                const response = await axios.get('http://localhost:3309/protected', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProtectedData(response.data);

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setError('Unauthorized access. Please log in again.');
                } else {
                    setError('อย่ามาหัวหมอไอชาติเปรต');
                }
            }
        };

        fetchProtectedData();

        const fetchUserData = async () => {
            const username = localStorage.getItem('username');
            console.log("username:", username);
        
            try {
                const response = await axios.get('http://localhost:3309/getuser', {
                    params: { username }
                });
                if (response.data && response.data.user_id) {
                    localStorage.setItem("user_id", response.data.user_id);
                } else {
                    alert("User ID not found in response.");
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    alert('Cannot find user with that username.');
                } else {
                    alert("An error occurred: " + error.message); 
                }
            }
        };

        fetchUserData();
        
    }, []);
    const signout = () =>{
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        navigate("/");
    }

    if (error) {
        return <div>{error}</div>;
    }



    return(
    <div className="hom-main">
        <div className="hom-leftbar">
            <img className="hom-profile-img" src="https://via.placeholder.com/150" alt="profile-pic"/>
            <button className="hom-btn add" onClick={goAddbill}>Add Bill</button>
            <button className="hom-btn remove" onClick={goRemovebill}>Remove Bill</button>
            <button className="hom-btn update" onClick={goUpdatebill}>Update Bill</button>
            <button className="hom-btn signout" onClick={signout}>Sign out</button>
        </div>
        
        <div className="hom-content-box">
            <div className="hom-section">
                <h3 className="hom-section-title reminder-title">Bill Reminder</h3>
                <div className="reminder-container">
                    <div className="reminder-list">
                        
                    </div>

                </div>
            </div>

            <div className="hom-section">
                <h3 className="hom-section-title noti-title">Notification</h3>
                <div className="noti-container">
                    <div className="noti-list">

                    </div>
                </div>
            </div>
        </div>
    </div>);
}