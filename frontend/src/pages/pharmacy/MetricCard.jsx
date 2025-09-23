import React from 'react';
import '../../assets/styles/MetricCard.css';

const MetricCard = ({ icon, title, value, alert = false }) => {
    return (
        <div className={`metric-card ${alert ? 'alert' : ''}`}>
            <div className="metric-icon">{icon}</div>
            <div className="metric-content">
                <span className="metric-title">{title}</span>
                <span className="metric-value">{value}</span>
            </div>
        </div>
    );
};

export default MetricCard;
