import React from "react";
import "../pageCSS/Home.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate();

    const goAddbill = () => {
        navigate("/addbill");
    };

    const goRemovebill = () => {
        navigate("/removebill");
    };

    const goUpdatebill = () => {
        navigate("/updatebill");
    };

    return(
    <div className="hom-main">
        <div className="hom-leftbar">
            <img className="hom-profile-img" src="https://via.placeholder.com/150" alt="profile-pic"/>
            <button className="hom-btn add" onClick={goAddbill}>Add Bill</button>
            <button className="hom-btn remove" onClick={goRemovebill}>Remove Bill</button>
            <button className="hom-btn update" onClick={goUpdatebill}>Update Bill</button>
            <button className="hom-btn signout">Sign out</button>
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