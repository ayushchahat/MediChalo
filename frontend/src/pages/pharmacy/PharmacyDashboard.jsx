import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { FaBoxes, FaChartLine, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

import MetricCard from './MetricCard';
import SalesChart from './SalesChart';
import RecentOrdersTable from './RecentOrdersTable';
import '../../assets/styles/PharmacyDashboard.css';

const PharmacyDashboard = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

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
                toast.error("Could not fetch dashboard data.");
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
        return <div className="error-message">Could not load dashboard data. Please try refreshing the page.</div>
    }

    return (
        <div className="pharmacy-dashboard">
            <header className="pd-header">
                <div className="pd-header-title">
                    <h1>{profile.pharmacyProfile?.shopName || "Pharmacy Dashboard"}</h1>
                    <p>Welcome back! Here's your business overview.</p>
                </div>
                <div className="pd-quick-actions">
                    <Link to="/pharmacy/inventory/add" className="action-btn">Add Medicine</Link>
                    <Link to="/pharmacy/reports" className="action-btn primary">View Reports</Link>
                </div>
            </header>

            <div className="metric-cards-grid">
                <MetricCard icon={<FaChartLine />} title="Today's Sales" value={`$${stats.todaysSales.toFixed(2)}`} />
                <MetricCard icon={<FaClipboardList />} title="Pending Orders" value={stats.pendingOrders} />
                <MetricCard icon={<FaBoxes />} title="Total Medicines" value={stats.totalStock} />
                <MetricCard icon={<FaExclamationTriangle />} title="Low Stock Items" value={stats.lowStockItems} alert={stats.lowStockItems > 0} />
            </div>

            <div className="dashboard-widgets-grid">
                <div className="widget-card chart-widget">
                    <h3>Sales Trends (Last 7 Days)</h3>
                    <SalesChart salesData={stats.salesTrend} />
                </div>
                <div className="widget-card orders-widget">
                    <h3>Recent Orders</h3>
                    <RecentOrdersTable orders={stats.recentOrders} />
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;

