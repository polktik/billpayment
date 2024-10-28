import React from "react";
import { useState,useEffect } from "react";
import "../pageCSS/Addbill.css";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from 'axios';
import icmobile from "../images/icon-mobile.png";
import iccredit from "../images/icon-credit.png";
import icutil from "../images/icon-util.png";
import iccontact from "../images/icon-contact.png";
import icrename from "../images/icon-rename.png";
import iccalendar from "../images/icon-calendar.png";

export default function Addbill() {
    const navigate = useNavigate();
    const [protectedData, setProtectedData] = useState(null);
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


    if (!protectedData) {
        return null;
    }



    const goAddMobile = () => {
        navigate("/addmobile")
    }

    const goAddCredit = () => {
        navigate("/addcredit")
    }

    const goAddUtil = () => {
        navigate("/addutil")
    }
    const goHome = () => {
        navigate("/home")
    }

    return (
        <div className="add-main">
            <div className="add-leftbar">
                <div className="add-addbill">Add Bill</div>
                <button className="add-btn" onClick={goAddMobile}>
                    <div className="icon-background">
                        <img src={icmobile} alt="Mobile Icon" className="icon-mobile" />
                    </div>
                    <span>Mobile</span>
                </button>

                <button className="add-btn" onClick={goAddCredit}>
                    <div className="icon-background">
                        <img src={iccredit} alt="Credit Card Icon" className="icon-credit" />
                    </div>
                    <span>Credit Card</span>
                </button>

                <button className="add-btn" onClick={goAddUtil}>
                    <div className="icon-background">
                        <img src={icutil} alt="utilities Icon" className="icon-util" />
                    </div>
                    <span>Utilities</span>
                </button>
            </div>
            <div className="add-content-box">
                <div className="add-section">
                    <div className="add-section-title mobile-title"></div>
                    <div className="container"></div>
                    <button className="back-btn" onClick={goHome}>Back</button>
                </div>
            </div>
        </div>
    );
}