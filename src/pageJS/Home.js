import React from "react";
import "../pageCSS/Home.css";
import axios from 'axios';

export default function Home() {
    return(
    <div className="hom-main">
        <div className="hom-leftbar">
            <img className="hom-profile-img" src="https://via.placeholder.com/150" alt="profile-pic"/>
            <button className="hom-btn add">Add Bill</button>
            <button className="hom-btn remove">Remove Bill</button>
            <button className="hom-btn update">Update Bill</button>
            <button className="hom-btn signout">Sign out</button>
        </div>
        <div className="hom-content-box">
            <div className="hom-section">
                <h3 className="hom-section-title reminder-title">Bill Reminder</h3>
                <div className="reminder-container">

                </div>
            </div>

            <div className="hom-section">
                <h3 className="hom-section-title noti-title">Notification</h3>
                <div className="noti-container">

                </div>

            </div>

        </div>
        
    
        
    </div>);
}