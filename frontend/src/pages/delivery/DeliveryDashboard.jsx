import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import SocketContext from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { FaToggleOn, FaToggleOff, FaHistory, FaRupeeSign, FaBoxOpen } from 'react-icons/fa';
import OrderCard from './OrderCard';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const socket = useContext(SocketContext);

    const [profile, setProfile] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Initialize dashboard and fetch profile/orders
    useEffect(() => {
        const initializeDashboard = async () => {
            if (!user) return;
            try {
                const { data } = await api.get('/users/profile');
                if (!data.deliveryProfile?.onboardingComplete) {
                    toast.info("Please complete your profile to access the dashboard.");
                    navigate('/delivery/onboarding');
                } else {
                    setProfile(data);
                    setIsOnline(data.deliveryProfile.isOnline || false);

                    const { data: ordersData } = await api.get('/orders/my-orders');
                    setAssignedOrders(
                        ordersData.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected by Partner')
                    );
                }
            } catch (error) {
                toast.error("Could not fetch your profile data.");
                console.error("Initialization Error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();
    }, [user, navigate]);

    // WebSocket listener for new orders
    useEffect(() => {
        if (!socket) return;

        const handleNewAssignment = (newOrder) => {
            toast.success("You have a new delivery assignment!");
            setAssignedOrders(prevOrders => {
                if (prevOrders.some(o => o._id === newOrder._id)) return prevOrders;
                return [newOrder, ...prevOrders];
            });
        };

        socket.on('new_assignment', handleNewAssignment);
        return () => socket.off('new_assignment', handleNewAssignment);
    }, [socket]);

    // Toggle online/offline status
    const handleToggleOnline = async () => {
        const newStatus = !isOnline;
        try {
            await api.put('/users/status', { isOnline: newStatus });
            setIsOnline(newStatus);
            toast.success(`You are now ${newStatus ? 'Online' : 'Offline'}`);
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    // Update assigned orders after changes from OrderCard
    const handleOrderUpdate = (updatedOrder) => {
        if (updatedOrder.status === 'Delivered' || updatedOrder.status === 'Rejected by Partner') {
            setAssignedOrders(prev => prev.filter(o => o._id !== updatedOrder._id));
        } else {
            setAssignedOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        }
    };

    if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

    return (
        <div className="delivery-dashboard-container">
            <header className="dd-header-stylish">
                <div className="dd-header-content">
                    <h1>Welcome, {profile?.name}</h1>
                    <p>Ready to deliver health in a flash?</p>
                </div>
                <button onClick={handleToggleOnline} className={`status-toggle ${isOnline ? 'online' : 'offline'}`}>
                    {isOnline ? <><FaToggleOn /> Online</> : <><FaToggleOff /> Offline</>}
                </button>
            </header>

            <nav className="dd-tabs">
                <Link
                    to="/delivery/dashboard"
                    className={`dd-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Active Deliveries
                </Link>
                <Link
                    to="/delivery/history"
                    className={`dd-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FaHistory /> History
                </Link>
                <Link
                    to="/delivery/earnings"
                    className={`dd-tab ${activeTab === 'earnings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('earnings')}
                >
                    <FaRupeeSign /> Earnings
                </Link>
            </nav>

            <main className="dd-main-content">
                {assignedOrders.length === 0 ? (
                    <div className="no-orders-card-stylish">
                        <FaBoxOpen className="no-orders-icon" />
                        <h2>No Active Deliveries</h2>
                        <p>
                            {isOnline
                                ? "You're all set! We'll notify you as soon as an order comes in."
                                : "You are currently offline. Toggle your status to start receiving orders."}
                        </p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {assignedOrders.map(order => (
                            <OrderCard key={order._id} orderData={order} onUpdate={handleOrderUpdate} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeliveryDashboard;
