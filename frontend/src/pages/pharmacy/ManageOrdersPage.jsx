import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import OrderManagementCard from './OrderManagementCard';
import '../../assets/styles/ManageOrdersPage.css';

const ManageOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('Pending');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/orders/pharmacy-orders?status=${activeTab}`);
                setOrders(data);
            } catch (error) {
                toast.error(`Failed to fetch ${activeTab.toLowerCase()} orders.`);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [activeTab]);

    const handleOrderUpdate = (orderId) => {
        // When an order is updated (e.g., accepted), remove it from the current view
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    };

    const tabs = ['Pending', 'Approved', 'Ready for Delivery', 'Rejected'];

    return (
        <div className="manage-orders-page">
            <header className="mop-header">
                <h1>Manage Customer Orders</h1>
            </header>
            <div className="mop-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="mop-content">
                {loading ? (
                    <div className="loading-spinner">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="no-orders-found">
                        <p>No {activeTab.toLowerCase()} orders found.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map(order => (
                            <OrderManagementCard
                                key={order._id}
                                order={order}
                                onUpdate={handleOrderUpdate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOrdersPage;
