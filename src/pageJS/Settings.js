import "../pageCSS/Settings.css";
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function Settings() {
    const navigate = useNavigate();
    const [protectedData, setProtectedData] = useState(null);
    const [userData, setUserData] = useState([]);
    const fileInputRef = useRef(null);

    
        useEffect(() => {
            const user_id = localStorage.getItem('user_id');
            const fetchUserData = async () => {
                try {
                    const response = await axios.get('http://localhost:3309/user_profile_data', {
                        params: { user_id }
                    });
                    setUserData(response.data);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };
    
            fetchUserData();
        }, []);
    
        const handleFileChange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const user_id = localStorage.getItem('user_id');
                const formData = new FormData();
                formData.append("user_id", user_id);
                formData.append("profile_pic", file);
    
                try {
                    await axios.put('http://localhost:3309/update_profilepics', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    });
    
                    const response = await axios.get('http://localhost:3309/user_profile_data', {
                        params: { user_id }
                    });
                    setUserData(response.data);
    
                    Swal.fire({
                        title: 'Success',
                        text: 'Profile picture updated successfully!',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to update profile picture.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            }
        };

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
                        text: 'Please sign in to access this page.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                        .then(() => {
                            navigate("/signin");
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

        const fetchUserData = async () => {
            const user_id = localStorage.getItem('user_id');
            console.log("user_id:", user_id);
        
            try {
                const response = await axios.get('http://localhost:3309/user_profile_data', {
                    params: { user_id }
                });
                console.log("Full response data:", response.data);
                
                if (response.data && response.data.length > 0) {
                    setUserData(response.data);
                } else {
                    console.warn("User data not found in response.");
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.warn("Unauthorized message");
                } else {
                    console.error("An error occurred:", error.message);
                }
            }
        };
        
        fetchProtectedData();
    }, [navigate]);

    const goChangePass = () => {
        navigate("/changepassword");
    };

    const goHomePage =() =>{
        navigate("/home");
    };

    if (!protectedData) {
        return null;
    }

    return (
        <div className="main-background">
            <div className="settings-list">
                {userData.length > 0 ? (
                    <>
                        <img
                            className="profile-img"
                            src={
                                userData[0].profile_pic
                                    ? `http://localhost:3309/${userData[0].profile_pic}`
                                    : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                            }
                            alt="profile-pic"
                            onClick={() => fileInputRef.current.click()}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".jpeg,.png,.jpg, .jfif"
                            onChange={handleFileChange}
                        />
                        <div className="name">
                            <span>Name</span>
                            <div className="user-box">{userData[0].first_name} {userData[0].last_name}</div>
                        </div>
                        <div className="username">
                            <span>Username</span>
                            <div className="user-box">{userData[0].username}</div>
                        </div>
                        <div className="email">
                            <span>Email</span>
                            <div className="user-box">{userData[0].email}</div>
                        </div>
                        <div className="password">
                            <span>Password</span>
                            <div className="password-box" onClick={goChangePass}>Change Password</div>
                        </div>
                        <button className="done" onClick={goHomePage}>Done</button>
                    </>
                ) : (
                    <div>Loading...</div> 
                )}
            </div>
        </div>
    );
}
