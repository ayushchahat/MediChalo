import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import './HistoryPage.css';

const DeliveryHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/delivery/history');
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="history-page">
            <h1>Delivery History</h1>
            {history.length === 0 ? <p>You have no completed deliveries.</p> : (
                <div className="history-list">
                    {history.map(order => (
                        <div key={order._id} className="history-item">
                            <p><strong>Order ID:</strong> {order._id.substring(0, 12)}...</p>
                            <p><strong>From:</strong> {order.pharmacy.shopName}</p>
                            <p><strong>To:</strong> {order.customer.name}</p>
                            <p><strong>Fee:</strong> ${order.deliveryFee.toFixed(2)}</p>
                            <p><strong>Date:</strong> {new Date(order.updatedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default DeliveryHistoryPage;
