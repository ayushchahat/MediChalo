import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useLanguage } from '../../hooks/useLanguage';

import MedicineCard from './MedicineCard';
import MedicineSearch from './MedicineSearch';
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
  const [customerLocation, setCustomerLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState(''); // ✅ new state for name

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: profileData } = await api.get('/users/profile');

        // ✅ store name and location from profile
        if (profileData) {
          setCustomerName(profileData.name || 'Customer');
          if (profileData.location?.coordinates) {
            setCustomerLocation(profileData.location.coordinates);
          }
        }

        const { data } = await api.get('/inventory/available');
        setAllMedicines(data);
        setFilteredMedicines(data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error(t('dashboard_load_error') || 'Could not load dashboard data.');
      } finally {
        setLoadingMedicines(false);
        setLoading(false);
      }
    };
    initializeDashboard();
  }, [t]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSearchResults = async (keyword) => {
    if (!keyword) {
      setFilteredMedicines(allMedicines);
      return;
    }
    try {
      setLoadingMedicines(true);
      const { data } = await api.get(`/inventory/search?keyword=${encodeURIComponent(keyword)}`);
      setFilteredMedicines(data);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error(t('search_error') || 'Search failed. Please try again.');
    } finally {
      setLoadingMedicines(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="loading-spinner">{t('loading_dashboard') || 'Loading Dashboard...'}</div>;
  }

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>{t(`Welcome, ${customerName}👋`) || `Welcome, ${customerName}👋`}</h1>
        <p>
          {t('Your one-stop solution for medicines, delivered right to your door.') ||
            'Your one-stop solution for medicines, delivered right to your door.'}
        </p>
      </div>

      {/* Search + Upload */}
      <div className="dashboard-top-grid">
        <div className="search-section">
          <h2>{t('Find Medicines') || 'Find Medicines'}</h2>
          <p>
            {t('Search for medicines and get them delivered quickly.') ||
              'Search for medicines and get them delivered quickly.'}
          </p>
          {/* ✅ Updated prop name to `onResults` */}
          <MedicineSearch onResults={handleSearchResults} customerLocation={customerLocation} />
        </div>

        <div className="prescription-section">
          <h2>{t('Upload Prescription') || 'Upload Prescription'}</h2>
          <PrescriptionUpload />
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="medicines-grid">
        {loadingMedicines ? (
          <div className="loading-spinner">{t('loading_medicines') || 'Loading Medicines...'}</div>
        ) : filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine._id}
              medicine={medicine}
              customerLocation={customerLocation}
            />
          ))
        ) : (
          <p>{t('no_medicines_found') || 'No medicines found matching your search.'}</p>
        )}
      </div>

      {/* Active Orders */}
      <div className="dashboard-active-orders">
        <ActiveOrders />
      </div>

      {/* My Orders */}
      <div className="dashboard-orders">
        <h2>{t('My Orders') || 'My Orders'}</h2>
        {loadingOrders ? (
          <p>{t('loading_orders') || 'Loading your orders...'}</p>
        ) : orders.length === 0 ? (
          <p>{t('no_orders') || 'You have no orders yet.'}</p>
        ) : (
          <div className="orders-list-dashboard">
            {orders.map((order) => (
              <div key={order._id} className="order-card-dashboard">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                {order.eta && ['Accepted by Partner', 'Out for Delivery'].includes(order.status) && (
                  <p><strong>ETA:</strong> {formatTime(order.eta)}</p>
                )}
                <Link to={`/track-order/${order._id}`} className="track-order-btn">
                  {t('Track Order') || 'Track Order'}
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
