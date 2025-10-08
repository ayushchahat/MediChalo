import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './ApprovePrescriptionModal.css';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => onClose(false)}>&times;</button>
                {children}
            </div>
        </div>
    );
};

const ApprovePrescriptionModal = ({ isOpen, onClose, order }) => {
    const [medicines, setMedicines] = useState([{ name: '', quantity: 1, price: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (index, event) => {
        const values = [...medicines];
        values[index][event.target.name] = event.target.value;
        setMedicines(values);
    };

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', quantity: 1, price: '' }]);
    };
    
    const handleRemoveMedicine = (index) => {
        const values = [...medicines];
        values.splice(index, 1);
        setMedicines(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/orders/${order._id}/update-prescription`, { medicines });
            toast.success("Order approved and updated successfully!");
            onClose(true); // Pass true to indicate an update happened
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve order.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const total = medicines.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    return (
        <Modal isOpen={isOpen} onClose={() => onClose(false)}>
            <h2>Approve Prescription Order</h2>
            <p>Order ID: {order?._id}</p>
            <a href={`http://localhost:5000/${order?.prescriptionImage}`} target="_blank" rel="noopener noreferrer">View Prescription</a>

            <form onSubmit={handleSubmit} className="approve-form">
                <h4>Add Medicines</h4>
                {medicines.map((medicine, index) => (
                    <div key={index} className="medicine-item-row">
                        <input type="text" name="name" placeholder="Medicine Name" value={medicine.name} onChange={e => handleInputChange(index, e)} required />
                        <input type="number" name="quantity" placeholder="Qty" value={medicine.quantity} onChange={e => handleInputChange(index, e)} min="1" required />
                        <input type="number" name="price" placeholder="Price (₹)" value={medicine.price} onChange={e => handleInputChange(index, e)} step="0.01" min="0" required />
                        <button type="button" onClick={() => handleRemoveMedicine(index)} className="remove-med-btn"><FaTrash /></button>
                    </div>
                ))}
                <button type="button" onClick={handleAddMedicine} className="add-med-btn"><FaPlus /> Add Another Medicine</button>

                <div className="approve-form-footer">
                    <div className="total-display">Total: <strong>₹{total.toFixed(2)}</strong></div>
                    <button type="submit" className="modal-btn confirm-approve" disabled={isSubmitting}>
                        {isSubmitting ? 'Approving...' : 'Approve & Finalize'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ApprovePrescriptionModal;
