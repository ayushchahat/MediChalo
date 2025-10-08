import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import DeliveryOrderMap from './DeliveryOrderMap';
import './DeliveryTrackOrderPage.css';
import { FaWarehouse, FaUser, FaRoute, FaCheckCircle, FaClipboardList } from 'react-icons/fa';

const DeliveryTrackOrderPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const { data } = await api.get(`/orders/${orderId}/track`);
                setOrder(data);
            } catch (error) {
                toast.error("Could not load order details.");
                navigate('/delivery/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, navigate]);

    const handleUpdateStatus = async (newStatus) => {
        try {
            const { data } = await api.put(`/orders/${order._id}/status`, { status: newStatus });
            setOrder(data);
            toast.success(`Order marked as "${newStatus}"`);
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    // Helper to safely format addresses
    const formatAddress = (addr) => {
        if (!addr || !addr.street || !addr.city) return "Address not available";
        return `${addr.street}, ${addr.city}`;
    };

    if (loading) return <div className="loading-spinner">Loading Order Details...</div>;
    // If loading is done but order is still null, show a friendly message
    if (!order) return <div className="error-message">Order data could not be loaded. Please go back.</div>;

    // --- Safely access all nested data using optional chaining (?.) ---
    const pharmacyCoords = order.pharmacy?.pharmacyProfile?.location?.coordinates;
    const customerCoords = order.customer?.location?.coordinates;
    const pharmacyName = order.pharmacy?.pharmacyProfile?.shopName || 'N/A';
    const pharmacyAddress = formatAddress(order.pharmacy?.pharmacyProfile?.address);
    const customerName = order.customer?.name || 'N/A';
    const customerAddress = formatAddress(order.customer?.address);

    const gmapsUrl = (pharmacyCoords && customerCoords)
        ? `https://www.google.com/maps/dir/?api=1&origin=${pharmacyCoords[1]},${pharmacyCoords[0]}&destination=${customerCoords[1]},${customerCoords[0]}`
        : '#';

    return (
        <div className="delivery-track-page">
            <header className="dtp-header">
                <h1>Delivery Details</h1>
                <p>Order ID: <strong>{order._id}</strong></p>
            </header>

            <div className="dtp-main-grid">
                <div className="dtp-details-panel">
                    <div className="address-card">
                        <FaWarehouse />
                        <div>
                            <h4>Pickup From</h4>
                            <p>{pharmacyName}</p>
                            <p className="address-text">{pharmacyAddress}</p>
                        </div>
                    </div>
                     <div className="address-card">
                        <FaUser />
                        <div>
                            <h4>Deliver To</h4>
                            <p>{customerName}</p>
                            <p className="address-text">{customerAddress}</p>
                        </div>
                    </div>
                    <div className="address-card">
                        <FaClipboardList />
                        <div>
                            <h4>Items in Order</h4>
                            <ul>
                                {order.medicines && order.medicines.length > 0 ? (
                                    order.medicines.map(med => (
                                        <li key={med._id || med.medicineId}>{med.name} (x{med.quantity})</li>
                                    ))
                                ) : (
                                    <li>No items found.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="dtp-map-panel">
                    {pharmacyCoords && customerCoords ? (
                        <DeliveryOrderMap
                            pharmacyLocation={[pharmacyCoords[1], pharmacyCoords[0]]}
                            customerLocation={[customerCoords[1], customerCoords[0]]}
                        />
                    ) : (
                        <div className="map-placeholder">Map not available. Location data is missing.</div>
                    )}
                </div>
            </div>

            <div className="dtp-actions">
                <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className={`action-btn navigate ${(!pharmacyCoords || !customerCoords) ? 'disabled' : ''}`}>
                    <FaRoute /> Open Navigation
                </a>
                {order.status === 'Accepted by Partner' && (
                    <button onClick={() => handleUpdateStatus('Out for Delivery')} className="action-btn pickup">
                        Confirm Pickup
                    </button>
                )}
                 {order.status === 'Out for Delivery' && (
                    <button onClick={() => navigate('/delivery/dashboard')} className="action-btn confirm">
                        <FaCheckCircle/> Confirm Delivery
                    </button>
                )}
            </div>
        </div>
    );
};

export default DeliveryTrackOrderPage;

