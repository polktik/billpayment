import React, { useEffect, useState } from "react";
import "../pageCSS/Home.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function Home() {
    const [protectedData, setProtectedData] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [userData, setUserData] = useState([]);
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
                fetchProfilePicture();
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

        fetchProtectedData();
    }, [navigate]);

    const signout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        localStorage.removeItem("email");
        navigate("/");
    };

    const goAddbill = () => {
        navigate("/addbill");
    };

    const goRemovebill = () => {
        navigate("/removebill");
    };

    const goUpdatebill = () => {
        navigate("/updatebill");
    };

    const goSetting = () => {
        navigate("/settings");
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
                const user_id = response.data.user_id;
                fetchNotifications(user_id);
                fetchUserBills(user_id);
            } else {
                alert("User ID not found in response.");
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert("Unauthorized message");
            } else {
                alert("An error occurred: " + error.message);
            }
        }
    };




    const fetchNotifications = async (user_id) => {
        try {
            const response = await axios.get('http://localhost:3309/notification', {
                params: { user_id }
            });

            // Get only the newest 20 notifications
            const latestNotifications = response.data
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 20);
            setNotifications(latestNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to load notifications.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const fetchUserBills = async (user_id) => {
        try {
            const response = await axios.get('http://localhost:3309/get_user_bills', {
                params: { user_id }
            });
            const latestUserBills = response.data
                .sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date))
                .slice(0, 20);
            setReminders(latestUserBills);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load notifications.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedReminders = [...reminders].sort((a, b) => {
            if (key === 'bill_date') {
                // การเรียงลำดับแบบพิเศษสำหรับวันที่
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);
                return direction === 'ascending' ? dateA - dateB : dateB - dateA;
            } else {
                if (a[key] < b[key]) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (a[key] > b[key]) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            }
        });
        setReminders(sortedReminders);
    };


    const fetchProfilePicture = async () => {
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
    if (!protectedData) {
        return null;
    }

    return (
        <div className="hom-main">
            <div className="hom-leftbar">
            <img
                    className="hom-profile-img"
                    src={
                        userData.length > 0 && userData[0].profile_pic
                            ? `http://localhost:3309/${userData[0].profile_pic}`
                            : "https://via.placeholder.com/150"
                    }
                    alt="profile-pic"
                    onClick={goSetting}
                />
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
                            <table>
                                <thead>
                                    <tr>
                                        <th className="canSort" onClick={() => sortData('status')}>Status</th>
                                        <th className="canSort" onClick={() => sortData('bill_type')}>Bill Type</th>
                                        <th>Bill Name</th>
                                        <th>Provider</th>
                                        <th>Number/Address</th>
                                        <th>Payment (Baht)</th>
                                        <th className="canSort" onClick={() => sortData('frequency_type')}>Frequency</th>
                                        <th className="canSort" onClick={() => sortData('bill_date')}>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reminders.map((reminder, index) => (
                                        <tr key={index}>
                                            <td>{reminder.status}</td>
                                            <td>{reminder.bill_type}</td>
                                            <td>{reminder.bill_name}</td>
                                            <td>{reminder.providers}</td>
                                            <td>{reminder.number_or_address}</td>
                                            <td>{reminder.total_payment}</td>
                                            <td>{reminder.frequency_type}</td>
                                            <td>{reminder.bill_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="hom-section">
                    <h3 className="hom-section-title noti-title">Notification</h3>
                    <div className="noti-container">
                        <div className="noti-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Bill Name</th>
                                        <th>Bill Type</th>
                                        <th>Provider</th>
                                        <th>Number/Address</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification, index) => (
                                        <tr key={index}>
                                            <td>{notification.action}</td>
                                            <td>{notification.bill_name}</td>
                                            <td>{notification.bill_type}</td>
                                            <td>{notification.provider}</td>
                                            <td>{notification.number_or_address}</td>
                                            <td>{new Date(notification.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
