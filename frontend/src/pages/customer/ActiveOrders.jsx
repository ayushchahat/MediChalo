import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';
import '../../assets/styles/ActiveOrders.css';

const ActiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/my-orders');
                // Show only active orders on the dashboard
                const active = data.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status));
                setOrders(active.slice(0, 3)); // Show max 3
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <div className="active-orders">
            <h3>Active Orders</h3>
            {loading && <p>Loading orders...</p>}
            {!loading && orders.length === 0 && (
                <p className="no-orders-msg">You have no active orders.</p>
            )}
            {orders.length > 0 && (
                 <ul className="order-list">
                    {orders.map(order => (
                        <li key={order._id} className="order-item-summary">
                            <div className="order-info">
                                <span className="order-id">ID: {order._id.substring(0, 8)}...</span>
                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                                {order.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <Link to="/customer/orders" className="view-all-link">View All Orders</Link>
        </div>
    );
};

export default ActiveOrders;
