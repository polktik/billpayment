import React, { useEffect,useState } from "react";
import "../pageCSS/Home.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function Home() {
    const [protectedData, setProtectedData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProtectedData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                unauthorizedRedirect();
                return;
            }
            
            try {
                const response = await axios.get('http://localhost:3309/protected', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProtectedData(response.data);
                fetchUserData();

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    unauthorizedRedirect();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while fetching data.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            }
        };

        const unauthorizedRedirect = () => {
            Swal.fire({
                title: 'Unauthorized',
                text: 'Please sign in to access this page.',
                icon: 'warning',
                confirmButtonText: 'Ok'
            }).then(() => {
                navigate("/signin");
            });
        };

        fetchProtectedData();
    }, [navigate]);

    const signout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        navigate("/signin");
    };

    const addbill = () => {
        navigate("/addbill");
    }


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
              alert("Unauthorize message");
            } else {
                alert("An error occurred: " + error.message); 
            }
        }
      };

    if (!protectedData) {
        return null;
    }
    return(
    <div className="hom-main">
        <div className="hom-leftbar">
            <img className="hom-profile-img" src="https://via.placeholder.com/150" alt="profile-pic"/>
            <button className="hom-btn add" onClick={addbill}>Add Bill</button>
            <button className="hom-btn remove">Remove Bill</button>
            <button className="hom-btn update">Update Bill</button>
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