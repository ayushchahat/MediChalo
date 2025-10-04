import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderTrackerMap from './OrderTrackerMap';
import { toast } from 'react-toastify';
import { FaBox, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import './TrackOrderPage.css';

const API_BASE_URL =
  'https://wh5u2vw3bi.execute-api.ap-south-1.amazonaws.com';

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        if (!response.ok) throw new Error('Order not found');

        const result = await response.json();
        const data = result.body ? JSON.parse(result.body) : result;
        setOrder(data);
      } catch (err) {
        toast.error('Failed to fetch order details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading-spinner">Loading Tracking Details...</div>;
  if (!order) return <div>Order not found.</div>;

  // Pass safe locations as strings for OrderTrackerMap
  const pharmacyLocation = order.pharmacy
    ? { latitude: order.pharmacy.latitude, longitude: order.pharmacy.longitude }
    : null;
  const customerLocation =
    order.latitude && order.longitude
      ? { latitude: order.latitude, longitude: order.longitude }
      : null;

  const steps = ['Placed', 'Assigned', 'Out for Delivery', 'Delivered'];
  const isStepCompleted = (stepStatus) =>
    steps.indexOf(stepStatus) <= steps.indexOf(order.status);

  return (
    <div className="track-order-page">
      <header className="track-header">
        <h1>Track Your Order</h1>
        <p>
          Order ID: <strong>{order.orderId}</strong>
        </p>
        {['assigned', 'Out for Delivery'].includes(order.status) && (
          <div className="eta-display">
            <FaClock />
            <span>
              Estimated Arrival: <strong>{formatTime(order.etaMinutes)}</strong>
            </span>
          </div>
        )}
      </header>

      {/* Timeline */}
      <div className="order-timeline">
        {steps.map((step) => (
          <div
            key={step}
            className={`timeline-step ${isStepCompleted(step) ? 'completed' : ''}`}
          >
            {step === 'Placed' && <FaBox />}
            {step === 'Assigned' && <FaTruck />}
            {step === 'Out for Delivery' && <FaTruck />}
            {step === 'Delivered' && <FaCheckCircle />}
            {step}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="order-map-container" style={{ height: '400px', marginTop: '2rem' }}>
        <OrderTrackerMap pharmacyLocation={pharmacyLocation} customerLocation={customerLocation} />
      </div>
    </div>
  );
};

export default TrackOrderPage;
