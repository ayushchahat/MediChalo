import React from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import '../../assets/styles/OrderManagementCard.css';

const OrderManagementCard = ({ order, onUpdate }) => {

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/orders/${order._id}/status`, { status: newStatus });
            toast.success(`Order has been ${newStatus.toLowerCase()}.`);
            onUpdate(order._id); // Notify parent component to remove this card from view
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

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

    const customerAddress = order.customer.address;

    return (
        <div className="omc-card">
            <div className="omc-header">
                <span className="omc-order-id">Order ID: {order._id.substring(0, 8)}...</span>
                <span className={`omc-status-tag status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
            </div>
            <div className="omc-body">
                <div className="omc-customer-details">
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {order.customer.name}</p>
                    <p><strong>Email:</strong> {order.customer.email}</p>
                    {customerAddress && <p><strong>Address:</strong> {`${customerAddress.street}, ${customerAddress.city}`}</p>}
                </div>
                {order.prescriptionImage && (
                    <div className="omc-prescription">
                        <h4>Prescription</h4>
                        <a href={`https://medichalo-backend.onrender.com/${order.prescriptionImage}`} target="_blank" rel="noopener noreferrer">
                            View Prescription
                        </a>
                    </div>
                )}
            </div>
            <div className="omc-footer">
                {renderActions()}
            </div>
        </div>
    );
};

export default OrderManagementCard;
