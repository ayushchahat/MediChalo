import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import '../../assets/styles/RecentOrdersTable.css';

const RecentOrdersTable = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                // Fetch the 5 most recent orders
                const { data } = await api.get('/orders/pharmacy-orders?limit=5');
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch recent orders:", error);
            }
        };
        fetchRecentOrders();
    }, []);

    const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="recent-orders-table">
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id.substring(0, 8)}...</td>
                            <td>{order.customer.name}</td>
                            <td><span className={`status-tag ${getStatusClass(order.status)}`}>{order.status}</span></td>
                        </tr>
                    )) : (
                        <tr><td colSpan="3">No recent orders.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrdersTable;
