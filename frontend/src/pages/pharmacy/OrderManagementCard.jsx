import React from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import '../../assets/styles/OrderManagementCard.css';

const OrderManagementCard = ({ order, onUpdate }) => {

    // Update order status
    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/orders/${order._id}/status`, { status: newStatus });
            toast.success(`Order has been ${newStatus.toLowerCase()}.`);
            onUpdate(order._id); // Notify parent to refresh/remove this card
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    // Render buttons based on order status
    const renderActions = () => {
        switch (order.status) {
            case 'Pending':
                return (
                    <>
                        <button onClick={() => handleStatusChange('Approved')} className="omc-btn approve">Accept</button>
                        <button onClick={() => handleStatusChange('Rejected')} className="omc-btn reject">Reject</button>
                    </>
                );
            case 'Approved':
                return (
                    <button onClick={() => handleStatusChange('Ready for Delivery')} className="omc-btn ready">Mark as Ready</button>
                );
            default:
                return null;
        }
    };

    const customerAddress = order.customer?.address;

    return (
        <div className="omc-card">
            {/* Header */}
            <div className="omc-header">
                <span className="omc-order-id">Order ID: {order._id.substring(0, 8)}...</span>
                <span className={`omc-status-tag status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
            </div>

            {/* Body */}
            <div className="omc-body">
                {/* Customer Info */}
                <div className="omc-customer-details">
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {order.customer?.name}</p>
                    <p><strong>Email:</strong> {order.customer?.email}</p>
                    {customerAddress && (
                        <p><strong>Address:</strong> {`${customerAddress.street}, ${customerAddress.city}`}</p>
                    )}
                </div>

                {/* Prescription Info */}
                {order.prescriptionImage ? (
                    <div className="omc-prescription-details">
                        <h4>Prescription Uploaded</h4>
                        <a
                            href={`https://medichalo-backend.onrender.com/${order.prescriptionImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-view-prescription"
                        >
                            View & Download Prescription
                        </a>
                    </div>
                ) : order.medicines && order.medicines.length > 0 ? (
                    <div className="omc-medicines-list">
                        <h4>Ordered Medicines</h4>
                        <ul>
                            {order.medicines.map(med => (
                                <li key={med.medicineId}>
                                    {med.name} (Qty: {med.quantity}) - <em>{med.status}</em>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>No items added yet.</p>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="omc-footer">
                {renderActions()}
            </div>
        </div>
    );
};

export default OrderManagementCard;
