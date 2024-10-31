import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../pageCSS/Updatebill.css";
import axios from 'axios';

export default function UpdateBill() {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [selectedBills, setSelectedBills] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const canSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedBills = [...bills].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setBills(sortedBills);
    };

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

    const togglePaid = () => {
        setBills(prevBills =>
            prevBills.map(bill =>
                selectedBills.includes(bill.bill_id) 
                ? { ...bill, status: bill.status === "Paid" ? "Unpaid" : "Paid" } 
                : bill
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
                <div className="bill-table-wrapper">
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th onClick={() => canSort('bill_type')} className="sortable">Categories</th>
                                <th onClick={() => canSort('providers')} className="sortable">Provider</th>
                                <th>Details</th>
                                <th>Due Date</th>
                                <th onClick={() => canSort('status')} className="sortable">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => (
                                <tr key={bill.bill_id}>
                                    <td>
                                        <input className="check"
                                            type="checkbox"
                                            checked={selectedBills.includes(bill.bill_id)}
                                            onChange={() => handleBillSelect(bill.bill_id)}
                                        />
                                    </td>
                                    <td>{bill.bill_type}</td>
                                    <td>{bill.providers}</td>
                                    <td>{bill.bill_name}</td>
                                    <td>{bill.bill_date}</td>
                                    <td style={{
                                        backgroundColor: bill.status === "Paid" ? "rgba(85, 168, 89, 0.7)" : "rgba(255, 99, 71)",
                                        color: "#ffffff",
                                        fontWeight: "bold"
                                    }}>{bill.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="button-container">
                <button className="back-button" onClick={goBack}>Back</button>
                <button className="paid-button" onClick={togglePaid}>Paid/Unpaid</button>
                <button className="done-button" onClick={updateSelectedBills}>Done</button>
            </div>
        </div>
    );
}
