import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../pageCSS/Updatebill.css";
import axios from 'axios';

export default function UpdateBill() {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [selectedBills, setSelectedBills] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            const user_id = localStorage.getItem("user_id");
            try {
                const response = await axios.get('http://localhost:3309/get_user_bills_for_update', { params: { user_id } });
                setBills(response.data);
            } catch (error) {
                console.error('Error fetching bills:', error);
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

    const handleBillSelect = (billId) => {
        setSelectedBills(prevSelectedBills =>
            prevSelectedBills.includes(billId)
                ? prevSelectedBills.filter(id => id !== billId)
                : [...prevSelectedBills, billId]
        );
    };

    const markAsPaid = () => {
        setBills(prevBills =>
            prevBills.map(bill =>
                selectedBills.includes(bill.bill_id) ? { ...bill, status: "paid" } : bill
            )
        );
    };

    const updateSelectedBills = async () => {
        const user_id = localStorage.getItem("user_id");
    
        if (selectedBills.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please select at least one bill to update.',
                icon: 'warning',
                confirmButtonText: 'Ok'
            });
            return;
        }
    
        try {
            const billsToUpdate = bills.filter(bill => selectedBills.includes(bill.bill_id));
    
            await Promise.all(billsToUpdate.map(bill =>
                axios.put('http://localhost:3309/update_user_bills', { 
                    user_id, 
                    bill_id: bill.bill_id,
                    bill_name: bill.bill_name,
                    bill_type: bill.bill_type,
                    providers: bill.providers,
                    number_or_address: bill.number_or_address,
                    total_payment: bill.total_payment,
                    frequency_type: bill.frequency_type,
                    bill_date: bill.bill_date,
                    status: bill.status
                })
            ));
    
            Swal.fire({
                title: 'Success',
                text: 'Selected bills have been updated.',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
    
            setSelectedBills([]); // Clear selected bills after update
        } catch (error) {
            console.error('Error updating bills:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to update bill data.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const goBack = () => {
        navigate('/home');
    };

    return (
        <div>
            <div className="update-bill-container">
                <div className="title">Bill List</div>
                <table className="bill-table">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Categories</th>
                            <th>Provider</th>
                            <th>Details</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill) => (
                            <tr key={bill.bill_id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedBills.includes(bill.bill_id)}
                                        onChange={() => handleBillSelect(bill.bill_id)}
                                    />
                                </td>
                                <td>{bill.bill_type}</td>
                                <td>{bill.providers}</td>
                                <td>{bill.bill_name}</td>
                                <td>{bill.bill_date}</td>
                                <td>{bill.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="button-container">
                <button className="back-button" onClick={goBack}>Back</button>
                <button className="paid-button" onClick={markAsPaid}>Paid</button>
                <button className="done-button" onClick={updateSelectedBills}>Done</button>
            </div>
        </div>
    );
}
