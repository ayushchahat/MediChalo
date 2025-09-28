import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import '../../assets/styles/AddMedicinePage.css';
import { FaPlusCircle, FaArrowLeft } from 'react-icons/fa';

const AddMedicinePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        batchNumber: '',
        expiryDate: '',
        quantity: '',
        price: '',
        prescriptionRequired: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/inventory', formData);
            toast.success('Medicine added successfully!');
            navigate('/pharmacy/inventory'); // Redirect to the main inventory list page
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add medicine.');
            console.error("Add Medicine Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for the min attribute of the date input
    const getTodayString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    return (
        <div className="add-medicine-container">
            <div className="add-medicine-card">
                <header className="am-header">
                    <Link to="/pharmacy/inventory" className="back-link"><FaArrowLeft /> Back to Inventory</Link>
                    <h1>Add New Medicine</h1>
                    <p>Fill in the details below to add a new item to your stock.</p>
                </header>

                <form onSubmit={handleSubmit} className="am-form">
                    <div className="form-group">
                        <label htmlFor="name">Medicine Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Paracetamol 500mg"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="batchNumber">Batch Number</label>
                            <input
                                type="text"
                                id="batchNumber"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                placeholder="e.g., PXG4587"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="expiryDate">Expiry Date</label>
                            <input
                                type="date"
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                min={getTodayString()}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="quantity">Quantity</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="e.g., 100"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price ($)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g., 10.50"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group-checkbox">
                        <input
                            type="checkbox"
                            id="prescriptionRequired"
                            name="prescriptionRequired"
                            checked={formData.prescriptionRequired}
                            onChange={handleChange}
                        />
                        <label htmlFor="prescriptionRequired">Prescription is required for this medicine</label>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        <FaPlusCircle /> {isSubmitting ? 'Adding...' : 'Add Medicine'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMedicinePage;
