import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../pageCSS/Removebill.css";
import axios from 'axios';

export default function Removebill() {
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
                const response = await axios.get('http://localhost:3309/get_user_bills_for_delete', { params: { user_id } });
                console.log(response.data);
                setBills(response.data);
            } catch (error) {
                console.error('Error fetching bills: ', error);
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

    const handleBillSelect = (bill_id) => {
        setSelectedBills(prevSelectedBills =>
            prevSelectedBills.includes(bill_id)
                ? prevSelectedBills.filter(id => id !== bill_id) // Unselect if already selected
                : [...prevSelectedBills, bill_id] // Select if not selected
        );
    };

    const deleteSelectedBills = async () => {
        const user_id = localStorage.getItem("user_id");
        if (selectedBills.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please select at least one bill to delete.',
                icon: 'warning',
                confirmButtonText: 'Ok'
            });
            return;
        }

        try {
            // Filter the selected bills from the bills array
            const billsToDelete = bills.filter(bill => selectedBills.includes(bill.bill_id));

            await Promise.all(billsToDelete.map(bill =>
                axios.delete("http://localhost:3309/delete_user_bills", {
                    data: { user_id, ...bill }
                })
            ));

            Swal.fire({
                title: 'Success',
                text: 'Selected bills have been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok'
            })
                .then(() => {
                    setBills(bills.filter(bill => !selectedBills.includes(bill.bill_id)));
                    setSelectedBills([]);
                });

            // Remove deleted bills from the state and clear selected bills
            // setBills(bills.filter(bill => !selectedBills.includes(bill.bill_id)));
            // setSelectedBills([]);

        } catch (error) {
            console.error('Error deleting bills: ', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete bill data.',
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
            <div className="remove-bill-container">
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
                            {bills.map(bill => (
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
                <button className="remove-button" onClick={deleteSelectedBills}>Remove</button>
            </div>
        </div>
    );
}
