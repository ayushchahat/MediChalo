import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWarehouse, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import './OrderCard.css';

const OrderCard = ({ orderData, onUpdate }) => {
    const [order, setOrder] = useState(orderData);
    const [otp, setOtp] = useState('');

    // Helper to safely format addresses
    const formatAddress = (addr) => {
        if (!addr || !addr.street || !addr.city) return "Address not available";
        return `${addr.street}, ${addr.city}`;
    };

    // Pickup & delivery info
    const pharmacyName = order.pharmacy?.pharmacyProfile?.shopName || order.pharmacy?.shopName || "Pharmacy";
    const customerName = order.customer?.name || "Customer";
    const pickupAddress = formatAddress(order.pharmacy?.pharmacyProfile?.address || order.pharmacy?.address);
    const deliveryAddress = formatAddress(order.customer?.address);

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(deliveryAddress)}`;

    // Update order status
    const handleStatusUpdate = async (newStatus) => {
        try {
            const { data } = await api.put(`/orders/${order._id}/status`, { status: newStatus });
            setOrder(data);
            if (onUpdate) onUpdate(data);
            toast.success(`Order status updated to "${newStatus}"`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status.");
        }
    };

    // Confirm delivery with OTP
    const handleConfirmDelivery = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) return toast.error("Please enter a valid OTP.");

        try {
            const { data } = await api.put(`/orders/${order._id}/confirm-delivery`, { otp });
            const updatedOrder = data.order || { ...order, status: 'Delivered' };
            setOrder(updatedOrder);
            if (onUpdate) onUpdate(updatedOrder);
            toast.success(data.message || 'Delivery confirmed!');
        } catch (error) {
            toast.error(error.response?.data?.message || "Delivery confirmation failed.");
        }
    };

    // Render action buttons based on status
    const renderActions = () => {
        switch (order.status) {
            case 'Approved':
                return (
                    <div className="order-actions">
                        <button onClick={() => handleStatusUpdate('Accepted by Partner')} className="btn-accept">Accept</button>
                        <button onClick={() => handleStatusUpdate('Rejected')} className="btn-decline">Decline</button>
                    </div>
                );
            case 'Accepted by Partner':
                return (
                    <div className="order-actions">
                        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="btn-navigate">Navigate to Pharmacy</a>
                        <button onClick={() => handleStatusUpdate('Out for Delivery')} className="btn-pickup">Confirm Pickup</button>
                    </div>
                );
            case 'Out for Delivery':
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
            case 'Delivered':
                return <p className="status-delivered">This order has been successfully delivered.</p>;
            default:
                return <p className="status-info">Current Status: {order.status}</p>;
        }
    };

    return (
        <div className="order-card-delivery">
            <div className="order-card-header">
                <h3>Order ID: {order._id.substring(0, 8)}...</h3>
                <span className={`order-status-tag status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {order.status}
                </span>
            </div>

            <div className="order-route">
                <div className="route-point">
                    <FaWarehouse className="route-icon pickup" />
                    <div>
                        <strong>Pickup From: {pharmacyName}</strong>
                        <p>{pickupAddress}</p>
                    </div>
                </div>
                <div className="route-point">
                    <FaUser className="route-icon delivery" />
                    <div>
                        <strong>Deliver To: {customerName}</strong>
                        <p>{deliveryAddress}</p>
                    </div>
                </div>
            </div>

            <div className="order-details">
                <p><strong>Payment:</strong> ₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>

            {renderActions()}

            {/* Always show tracking link */}
            <div className="order-actions">
                <Link to={`/delivery/track/${order._id}`} className="track-btn">
                    <FaMapMarkerAlt /> View Details & Map
                </Link>
            </div>
        </div>
    );
};

export default OrderCard;
