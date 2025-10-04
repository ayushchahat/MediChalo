import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

import MedicineSearch from './MedicineSearch';
import MedicineCard from './MedicineCard';
import PrescriptionUpload from './PrescriptionUpload';
import ActiveOrders from './ActiveOrders';

import '../../assets/styles/CustomerDashboard.css';

const CustomerDashboard = () => {
  const { t } = useLanguage();
  const [allMedicines, setAllMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch all medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const { data } = await api.get('/inventory/available');
        setAllMedicines(data);
        setFilteredMedicines(data);
      } catch (error) {
        toast.error(t('fetch_medicines_error') || 'Could not fetch medicines.');
      } finally {
        setLoadingMedicines(false);
      }
    };
    fetchMedicines();
  }, [t]);

  // Fetch customer's orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredMedicines(allMedicines);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = allMedicines.filter((med) =>
        med.name.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredMedicines(filtered);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>{t('welcome_customer') || 'Welcome!'}</h1>
        <p>{t('customer_dashboard_subtitle') || 'Your one-stop solution for medicines, delivered right to your door.'}</p>
      </div>

      {/* Search Section */}
      <div className="dashboard-search">
        <MedicineSearch onSearch={handleSearch} />
      </div>

      {/* Medicines Grid */}
      <div className="medicines-grid">
        {loadingMedicines ? (
          <div className="loading-spinner">{t('loading_medicines') || 'Loading Medicines...'}</div>
        ) : filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => <MedicineCard key={med._id} medicine={med} />)
        ) : (
          <p>{t('no_medicines_found') || 'No medicines found matching your search.'}</p>
        )}
      </div>

      {/* Prescription Upload + Active Orders */}
      <div className="dashboard-grid">
        <div className="grid-item">
          <PrescriptionUpload />
        </div>
        <div className="grid-item">
          <ActiveOrders />
        </div>
      </div>

      {/* My Orders Section */}
      <div className="dashboard-orders">
        <h2>My Orders</h2>
        {loadingOrders ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <div className="orders-list-dashboard">
            {orders.map(order => (
              <div key={order._id} className="order-card-dashboard">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                {order.eta && ['Accepted by Partner', 'Out for Delivery'].includes(order.status) && (
                  <p><strong>ETA:</strong> {formatTime(order.eta)}</p>
                )}
                <Link to={`/track-order/${order._id}`} className="track-order-btn">
                  Track Order
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
