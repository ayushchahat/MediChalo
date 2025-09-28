import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaPlus, FaBoxOpen } from 'react-icons/fa';
import '../../assets/styles/InventoryPage.css';

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const { data } = await api.get('/inventory');
                setMedicines(data);
            } catch (error) {
                toast.error("Failed to fetch inventory.");
                console.error("Fetch Inventory Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="loading-spinner">Loading Inventory...</div>;
    }

    return (
        <div className="inventory-page">
            <header className="inventory-header">
                <h1>My Inventory</h1>
                <Link to="/pharmacy/add-medicine" className="add-medicine-btn">
                    <FaPlus /> Add New Medicine
                </Link>
            </header>

            {medicines.length === 0 ? (
                <div className="no-medicines-card">
                    <FaBoxOpen className="no-medicines-icon" />
                    <h2>No Medicine Found</h2>
                    <p>Your inventory is currently empty. Get started by adding your first medicine.</p>
                </div>
            ) : (
                <div className="medicines-table-container">
                    <table className="medicines-table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Batch No.</th>
                                <th>Stock Quantity</th>
                                <th>Price ($)</th>
                                <th>Expiry Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.map((med) => (
                                <tr key={med._id}>
                                    <td>{med.name}</td>
                                    <td>{med.batchNumber}</td>
                                    <td>{med.quantity}</td>
                                    <td>{med.price.toFixed(2)}</td>
                                    <td>{formatDate(med.expiryDate)}</td>
                                    <td className="actions-cell">
                                        <button className="action-btn-edit">Edit</button>
                                        <button className="action-btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
