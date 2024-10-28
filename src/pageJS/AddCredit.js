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

export default function Addbill() {
    const navigate = useNavigate();
    const [protectedData, setProtectedData] = useState(null);
    const [pageSelect, setPageSelect] = useState('');
    const [frequency, setFrequency] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [cardNumber, setCardNumber]= useState('');
    const [scheduleName, setScheduleName] = useState('');
    const [money,setMoney] = useState('');
    
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


    const handleInputChange = (e) => {
        setScheduleName(e.target.value);
      };

    const handleCardInput = (e) => {
        setCardNumber(e.target.value);
    };
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
      };

    //   const handleSetTo28th = () => {
    //     setSelectedDate("28");
    //   };

      const handleMoneyChange = (e) => {
        setMoney(e.target.value);
      };




    const handleInput = async (event)=>{
        event.preventDefault();
        const user_id = localStorage.getItem("user_id");
        const type = "Mobile";
        const provider = selectedProvider;
        const num = cardNumber;
        const payment = money;
        const date = selectedDate
        const name = scheduleName;
        console.log("user_id = ",user_id);
        try{
            const response = await axios.post("http://localhost:3309/insert_user_bill",{user_id, type, provider, num, payment, frequency, name, date});
            console.log(response.data);
            if(response.data.success){
                Swal.fire({
                    title: 'SUCCESS',
                    text: 'Insert data successfully!',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
            }else{
                Swal.fire({
                    title: 'UNSUCCESSFUL!',
                    html: 'Error to insert data <br/> Please try again.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }catch (error){
            Swal.fire({
                title: 'Unsuccessful!',
                html: 'Invalid username or password!<br/> Please try again.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            
        }

    };
    

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

    useEffect(() => {
        if (frequency === 'Monthly') {
          setSelectedDate('28');
        }
      }, [frequency]);

    const renderFrequencyInput = () => {
        switch (frequency) {
            case 'Once':
                return (
                    <div className="freq-detail">
                        <div>
                            <input className="schedule-name" type="text" placeholder="Schedule Name." required value={scheduleName} onChange={handleInputChange}/>
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
                            <input className="schedule-name" type="text" placeholder="Schedule Name." required  value={scheduleName} onChange={handleInputChange}/>
                            <img src={icrename} alt="Contact Icon" className="icon-rename" />
                        </div>
                        <div className="date-container">
                            <select className="date" value={selectedDate} onChange={handleDateChange}>
                                <option value="" disabled selected>Select a day</option>
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
                            <input className="schedule-name" type="text" placeholder="Schedule Name." required  value={scheduleName} onChange={handleInputChange} />
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

    if (!protectedData) {
        return null;
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
                        <div className="cre-section">
                            <div className="add-section-title mobile-title">Mobile details</div>
                            <div className="cre-container">
                                <div className="provider">
                                    <button
                                        className={`cre-btn kbank ${selectedProvider === 'kbank' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('kbank')}
                                    >
                                        KBank Card
                                    </button>
                                    <button
                                        className={`cre-btn aeon ${selectedProvider === 'aeon' ? 'selected' : ''}`}
                                        onClick={() => setSelectedProvider('aeon')}
                                    >
                                        AEON Thana Sinsap
                                    </button>

                                    <div className="mobile-input">
                                        <input className="mobile-num" type="text" placeholder="Enter Card No." required value={cardNumber} onChange={handleCardInput} />
                                        <img src={iccredit} alt="Contact Icon" className="icon-contact" />
                                    </div>
                                    <div className="mobile-input">
                                        <input className="mobile-num" type="text" placeholder="Amount of money." required value ={money} onChange={handleMoneyChange}/>
                                        <img src={icbaht} alt="Contact Icon" className="icon-contact" />
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
                            <div className="btn-container">
                                <button className="cre-back-btn" onClick={goAddbill}>Back</button>
                                <button className="proceed-btn" onClick={handleInput}>Proceed</button>
                            </div>
                        </div>
                    </div>
        </div>
    );
}