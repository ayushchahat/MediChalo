import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import './OrderCard.css';

const OrderCard = ({ orderData }) => {
    const [order, setOrder] = useState(orderData);
    const [otp, setOtp] = useState('');

    const handleStatusUpdate = async (newStatus) => {
        try {
            const { data } = await api.put(`/orders/${order._id}/status`, { status: newStatus });
            setOrder(data);
            toast.success(`Order status updated to "${newStatus}"`);
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleConfirmDelivery = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            return toast.error("Please enter a valid OTP.");
        }
        try {
            const { data } = await api.put(`/orders/${order._id}/confirm-delivery`, { otp });
            setOrder(data.order); // Use the updated order from the response
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Delivery confirmation failed.");
        }
    };

    // Safely construct addresses to avoid errors if data is missing
    const pickupAddress = order.pharmacy?.address ? `${order.pharmacy.address.street}, ${order.pharmacy.address.city}` : 'Pharmacy Location';
    const deliveryAddress = order.customer?.address ? `${order.customer.address.street}, ${order.customer.address.city}` : 'Customer Location';
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(deliveryAddress)}`;

    const renderActions = () => {
        // This assumes the pharmacy sets the status to 'Approved' or 'Assigned'
        // Let's use 'Approved' as the trigger for the partner to see it.
        if (order.status === 'Approved') {
            return (
                <div className="order-actions">
                    <button onClick={() => handleStatusUpdate('Accepted by Partner')} className="btn-accept">Accept</button>
                    <button onClick={() => handleStatusUpdate('Rejected')} className="btn-decline">Decline</button>
                </div>
            );
        }
        if (order.status === 'Accepted by Partner') {
            return (
                <div className="order-actions">
                    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="btn-navigate">Navigate to Pharmacy</a>
                    <button onClick={() => handleStatusUpdate('Out for Delivery')} className="btn-pickup">Confirm Pickup</button>
                </div>
            );
        }
        if (order.status === 'Out for Delivery') {
            return (
                <div className="order-delivery-section">
                    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="btn-navigate">Navigate to Customer</a>
                    <form onSubmit={handleConfirmDelivery} className="otp-form">
                        <input
                            type="text"
                            placeholder="Enter Customer OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="otp-input"
                            required
                        />
                        <button type="submit" className="btn-confirm">Confirm Delivery</button>
                    </form>
                </div>
            );
        }
        if (order.status === 'Delivered') {
            return <p className="status-delivered">This order has been successfully delivered.</p>;
        }
        // For other statuses like 'Rejected', 'Pending', etc.
        return <p className="status-info">Current Status: {order.status}</p>;
    };

    return (
        <div className="order-card-delivery">
            <div className="order-card-header">
                <h3>Order ID: {order._id.substring(0, 8)}...</h3>
                <span className={`order-status-tag status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {order.status}
                </span>
            </div>
            <div className="order-details">
                <p><strong>Pickup From:</strong> {order.pharmacy?.shopName || 'N/A'}</p>
                <p><strong>Deliver To:</strong> {order.customer?.name || 'N/A'}</p>
                <p><strong>Payment:</strong> ${order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            {renderActions()}
        </div>
    );
};

export default OrderCard;

