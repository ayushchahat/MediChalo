import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import MetricCard from './MetricCard';
import SalesChart from './SalesChart';
import RecentOrdersTable from './RecentOrdersTable';
import '../../assets/styles/PharmacyDashboard.css';
import { FaBoxes, FaChartLine, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa';

const PharmacyDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);

    // --- DUMMY DATA FOR SALES CHART ---
    // This function generates sample data for the last 7 days.
    const generateDummySalesData = () => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            // Using a short weekday name for labels (e.g., "Mon", "Tue")
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
            const sales = Math.floor(Math.random() * 500) + 50; // Random sales between $50 and $550
            data.push({ date: dayLabel, totalSales: sales });
        }
        return data;
    };

    const dummySalesData = generateDummySalesData();
    // --- END OF DUMMY DATA ---

    useEffect(() => {
        const checkOnboardingAndFetchData = async () => {
            if (!user) return;
            try {
                const { data: profileData } = await api.get('/users/profile');
                if (!profileData.pharmacyProfile?.onboardingComplete) {
                    toast.info("Please complete your profile to access the dashboard.");
                    navigate('/pharmacy/onboarding');
                    return;
                }
                setProfile(profileData);

                const { data: statsData } = await api.get('/reports/dashboard-stats');
                setStats(statsData);

            } catch (error) {
                toast.error("Could not fetch dashboard stats.");
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        checkOnboardingAndFetchData();
    }, [user, navigate]);

    if (loading) {
        return <div className="loading-spinner">Loading Dashboard...</div>;
    }

    if (!stats || !profile) {
        return <div>Could not load dashboard data. Please try again later.</div>
    }

    return (
        <div className="pharmacy-dashboard">
            <header className="pd-header">
                <h1>{profile.pharmacyProfile?.shopName || "Pharmacy Dashboard"}</h1>
                <div className="pd-quick-actions">
                    <Link to="/pharmacy/inventory" className="action-btn">Manage Inventory</Link>
                    <Link to="/pharmacy/orders" className="action-btn primary">View Orders</Link>
                </div>
            </header>

            <div className="metric-cards-grid">
                <MetricCard icon={<FaBoxes />} title="Total Stock" value={stats.totalStock} />
                <MetricCard icon={<FaChartLine />} title="Today's Sales" value={`$${stats.todaysSales.toFixed(2)}`} />
                <MetricCard icon={<FaClipboardList />} title="Pending Orders" value={stats.pendingOrders} />
                <MetricCard icon={<FaExclamationTriangle />} title="Low Stock Items" value={stats.lowStockItems} />
            </div>

            <div className="dashboard-widgets-grid">
                <div className="widget-card">
                    <h3>Sales Trends (Last 7 Days)</h3>
                    {/* The chart now receives the dummy data */}
                    <SalesChart salesData={dummySalesData} />
                </div>
                <div className="widget-card">
                    <h3>Recent Orders</h3>
                    <RecentOrdersTable orders={stats.recentOrders} />
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;

