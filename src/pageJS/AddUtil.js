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
import icbaht from "../images/icon-baht.png";
import icaddress from "../images/icon-address.png";

export default function Addbill() {
    const navigate = useNavigate();
    const [protectedData, setProtectedData] = useState(null);
    const [pageSelect, setPageSelect] = useState('');
    const [frequency, setFrequency] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');

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
    const goAddbill = () => {
        navigate('/addbill');
    }


    const showDatePicker = async () => {
        const { value: date } = await Swal.fire({
            title: "Select reminder date",
            input: "date",
            didOpen: () => {
                const today = (new Date()).toISOString();
                Swal.getInput().min = today.split("T")[0];
            }
        });
        if (date) {
            Swal.fire("Selected date: ", date);
            setSelectedDate(date)
        }
    };

    const renderFrequencyInput = () => {
        switch (frequency) {
            case 'Monthly':
                return (
                    <div className="freq-detail">
                        <div>
                            <input className="schedule-name" type="text" placeholder="Schedule Name." required />
                            <img src={icrename} alt="Contact Icon" className="icon-rename" />
                        </div>
                        <div className="date-container">
                            <div className="month-text">On the 28th of every month.</div>
                            <img src={iccalendar} alt="Calendar Icon" className="icon-calendar" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

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
                        <div className="cre-section">
                            <div className="add-section-title mobile-title">Mobile details</div>
                            <div className="cre-container">
                                <div className="provider">
                                    <button
                                        className={`cre-btn elec ${selectedProvider === 'elec' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('elec')}
                                    >
                                        Electronics
                                    </button>
                                    <button
                                        className={`cre-btn water ${selectedProvider === 'water' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('water')}
                                    >
                                        Water
                                    </button>

                                    <div className="mobile-input">
                                        <input className="mobile-num" type="text" placeholder="Enter Address." required />
                                        <img src={icaddress} alt="Contact Icon" className="icon-contact" />
                                    </div>
                                </div>

                                <div className="add-section-title freq-title">Frequency</div>
                                <div className="freq-options">
                                    <input className="freq-input monthly"
                                        type="radio"
                                        name="frequency"
                                        value="Monthly"
                                        checked={frequency === 'Monthly'}
                                        onChange={() => setFrequency('Monthly')}
                                    />Monthly
                                </div>
                                {renderFrequencyInput()}
                            </div>
                            <div className="btn-container">
                                <button className="cre-back-btn" onClick={goAddbill}>Back</button>
                                <button className="proceed-btn">Proceed</button>
                            </div> 
                        </div>
                    </div>
        </div>
    );
}