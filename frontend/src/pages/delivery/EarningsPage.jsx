import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import './EarningsPage.css';

const DeliveryEarningsPage = () => {
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const { data } = await api.get('/delivery/earnings');
                setEarnings(data);
            } catch (error) {
                console.error("Failed to fetch earnings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return <div>Loading earnings summary...</div>;

    return (
        <div className="earnings-page">
            <h1>Earnings Overview</h1>
            <div className="earnings-summary">
                <div className="earnings-card">
                    <h2>Total Earnings</h2>
                    <p>${earnings?.totalEarnings.toFixed(2) || '0.00'}</p>
                </div>
                <div className="earnings-card">
                    <h2>Total Deliveries</h2>
                    <p>{earnings?.totalDeliveries || 0}</p>
                </div>
            </div>
        </div>
    );
};
export default DeliveryEarningsPage;
