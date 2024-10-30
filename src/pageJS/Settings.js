import "../pageCSS/Settings.css";
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function Settings() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleProfileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Selected file:", file);
        }
    };

    const goChangePass = () => {
        navigate("/changepassword")
    }

    return(
    <div className="main-background">
        <div className="settings-list">
            <img className="profile-img" src="https://via.placeholder.com/150" alt="profile-pic" onClick={handleProfileClick} />
            <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept=".jpeg,.png"
                    onChange={handleFileChange}
            />
            <div className="name">
                <span>Name</span>
                <div className="user-box">Polkrit Tikhana</div>
            </div>
            <div className="username">
                <span>Username</span>
                <div className="user-box">kkkkk</div>
            </div>
            <div className="email">
                <span>Email</span>
                <div className="user-box">polkrit2002@gmail.com</div>
            </div>
            <div className="password">
                <span>Password</span>
                <div className="password-box" onClick={goChangePass}>Change Password</div>
            </div>
            <button className="done">Done</button>
        </div>
    </div>);
}