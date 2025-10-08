import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import './AddressModal.css';

const AddressModal = ({ isOpen, onClose, onSave }) => {
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data } = await api.put('/users/address', address);
            toast.success(data.message);
            onSave(data.address); // Pass the saved address back to the cart page
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save address.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content address-modal">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>Enter Delivery Address</h2>
                <form onSubmit={handleSubmit} className="address-form">
                    <input name="street" placeholder="Street Address" onChange={handleChange} required />
                    <input name="city" placeholder="City" onChange={handleChange} required />
                    <input name="state" placeholder="State" onChange={handleChange} required />
                    <input name="zipCode" placeholder="Zip Code" onChange={handleChange} required />
                    <button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Address'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;
