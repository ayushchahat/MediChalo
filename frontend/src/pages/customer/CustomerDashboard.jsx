import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import MedicineSearch from './MedicineSearch';
import PrescriptionUpload from './PrescriptionUpload';
import ActiveOrders from './ActiveOrders';
import '../../assets/styles/CustomerDashboard.css';

const CustomerDashboard = () => {
    const { t } = useLanguage();
    
    return (
        <div className="customer-dashboard">
            <div className="dashboard-header">
                <h1>{t('welcome_customer')}</h1>
                <p>Your one-stop solution for medicines, delivered right to your door.</p>
            </div>
            
            <div className="dashboard-grid">
                <div className="grid-item wide">
                    <MedicineSearch />
                </div>
                <div className="grid-item">
                    <PrescriptionUpload />
                </div>
                <div className="grid-item">
                    <ActiveOrders />
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
