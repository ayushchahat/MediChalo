import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import OrderManagementCard from './OrderManagementCard';
import '../../assets/styles/ManageOrdersPage.css';
import { FaClipboardList, FaCheckCircle, FaTruck, FaTimesCircle } from 'react-icons/fa';

const ManageOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders whenever the active tab changes
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/pharmacy-orders?status=${activeTab}`);
        setOrders(data);
      } catch (error) {
        toast.error(`Failed to fetch ${activeTab.toLowerCase()} orders.`);
        console.error('Fetch Orders Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  // Remove an order from view after status update
  const handleOrderUpdate = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
  };

  // Tabs with icons
  const tabs = [
    { name: 'Pending', icon: <FaClipboardList /> },
    { name: 'Approved', icon: <FaCheckCircle /> },
    { name: 'Ready for Delivery', icon: <FaTruck /> },
    { name: 'Rejected', icon: <FaTimesCircle /> }
  ];

  return (
    <div className="manage-orders-page">
      <header className="mop-header">
        <h1>Manage Customer Orders</h1>
        <p>View and process all incoming orders from customers.</p>
      </header>

      <div className="mop-tabs">
        {tabs.map(tab => (
          <button
            key={tab.name}
            className={`tab-btn ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon} <span>{tab.name}</span>
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
