import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../pageCSS/Removebill.css";
import axios from 'axios';

export default function Removebill() {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get('');
                setBills(response.data);
            } catch (error) {
                console.error('Error fetching bills: ',error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to fetch bill data.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        };
        fetchBills();
    }, []);

    const goBack = () => {
        navigate('/home');
    };

    return(<div>
        <div className="remove-bill-container">
            <div className="title">Bill List</div>
            <table className="bill-table">
                <thead>
                    <tr>
                        <th>Categories</th>
                        <th>Details</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map(bill => (
                        <tr key={bill.id}>
                            <td>{bill.category}</td>
                            <td>{bill.details}</td>
                            <td>{bill.due_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="button-container">
            <button className="back-button" onClick={goBack}>Back</button>
            <button className="remove-button">Remove</button>
        </div>
    </div>
    );
}