import React from "react";
import { useState } from "react";
import "../pageCSS/Addbill.css";
import Swal from 'sweetalert2';
import axios from 'axios';
import icmobile from "../images/icon-mobile.png";
import iccredit from "../images/icon-credit.png";
import icutil from "../images/icon-util.png";
import iccontact from "../images/icon-contact.png";
import icrename from "../images/icon-rename.png";
import iccalendar from "../images/icon-calendar.png";

export default function bkAddbill() {
    const [pageSelect, setPageSelect] = useState('');
    const [frequency, setFrequency] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');

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
            case 'Once':
                return (
                    <div className="freq-detail">
                        <div>
                            <input className="schedule-name" type="text" placeholder="Enter Schedule Name." required />
                            <img src={icrename} alt="Contact Icon" className="icon-rename" />
                        </div>

                        <div className="date-container">
                            <input
                                className="date"
                                type="text"
                                value={selectedDate}
                                placeholder="Select Date."
                                required
                                readOnly
                            />
                            <img
                                src={iccalendar}
                                alt="Calendar Icon"
                                className="icon-calendar"
                                onClick={showDatePicker}
                            />
                        </div>
                    </div>
                );
            case 'Weekly':
                return (
                    <div className="freq-detail">
                        <div>
                            <input className="schedule-name" type="text" placeholder="Enter Schedule Name." required />
                            <img src={icrename} alt="Contact Icon" className="icon-rename" />
                        </div>
                        <div className="date-container">
                            <select className="date">
                                <option value="Sunday">Sunday</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                            </select>
                            <img src={iccalendar} alt="Calendar Icon" className="icon-calendar" />
                        </div>

                    </div>
                );
            case 'Monthly':
                return (
                    <div className="freq-detail">
                        <div>
                            <input className="schedule-name" type="text" placeholder="Enter Schedule Name." required />
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


    const renderContent = () => {
        switch (pageSelect) {
            case 'mobile':
                return (
                    <div className="add-content-box">
                        <div className="add-section">
                            <div className="add-section-title mobile-title">Mobile details</div>
                            <div className="container">
                                <div className="provider">
                                    <button
                                        className={`pro-btn ais ${selectedProvider === 'AIS' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('AIS')}
                                    >
                                        AIS
                                    </button>
                                    <button
                                        className={`pro-btn dtac ${selectedProvider === 'DTAC' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('DTAC')}
                                    >
                                        DTAC
                                    </button>
                                    <button
                                        className={`pro-btn truemove ${selectedProvider === 'Truemove H' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('Truemove H')}
                                    >
                                        Truemove H
                                    </button>

                                    <div className="mobile-input">
                                        <input className="mobile-num" type="tel" placeholder="Enter Mobile No." required />
                                        <img src={iccontact} alt="Contact Icon" className="icon-contact" />
                                    </div>
                                </div>

                                <div className="add-section-title freq-title">Frequency</div>
                                <div className="freq-options">
                                    <input className="freq-input once"
                                        type="radio"
                                        name="frequency"
                                        value="Once"
                                        checked={frequency === 'Once'}
                                        onChange={() => setFrequency('Once')}
                                    />Once
                                    <input className="freq-input weekly"
                                        type="radio"
                                        name="frequency"
                                        value="Weekly"
                                        checked={frequency === 'Weekly'}
                                        onChange={() => setFrequency('Weekly')}
                                    />Weekly
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
                            <div className="back-btn">Back</div>
                            <div className="proceed-btn">Proceed</div>
                        </div>
                    </div>
                );

            case 'credit':
                return (
                    <div className="add-content-box">
                        <div className="add-section">
                            <div className="add-section-title credit-title">Card details</div>
                            <button>Kbank Card</button>
                            <button>AEON Card</button>
                            <div>Enter Card No. <input type="text" /></div>
                            <div>Amount of money <input type="text" /></div>
                            {/* Add other credit card details */}
                        </div>
                    </div>
                );

            case 'util':
                return (
                    <div className="add-content-box">
                        <div className="add-section">
                            <div className="add-section-title util-title">Details</div>
                            <button>Electronics</button>
                            <button>Water</button>
                            <div>Address <input type="text" /></div>
                            {/* Add other utility details */}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="add-content-box">
                        <div className="add-section">
                            <div className="add-section-title mobile-title"></div>
                            <div className="container"></div>
                            <div className="back-btn">Back</div>
                            
                        </div>
                    </div>
                );

        }
    };


    return (
        <div className="add-main">
            <div className="add-leftbar">
                <div className="add-addbill">Add Bills</div>
                <button className="add-btn" onClick={() => setPageSelect('mobile')}>
                    <div className="icon-background">
                        <img src={icmobile} alt="Mobile Icon" className="icon-mobile" />
                    </div>
                    <span>Mobile</span>
                </button>

                <button className="add-btn" onClick={() => setPageSelect('credit')}>
                    <div className="icon-background">
                        <img src={iccredit} alt="Credit Card Icon" className="icon-credit" />
                    </div>
                    <span>Credit Card</span>
                </button>

                <button className="add-btn" onClick={() => setPageSelect('util')}>
                    <div className="icon-background">
                        <img src={icutil} alt="utilities Icon" className="icon-util" />
                    </div>
                    <span>Utilities</span>
                </button>
            </div>
            {renderContent()}
        </div>
    );
}