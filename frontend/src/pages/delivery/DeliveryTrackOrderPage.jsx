import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeliveryOrderMap from './DeliveryOrderMap';
import axios from 'axios';
import './DeliveryTrackOrderPage.css';
import { FaWarehouse, FaUser, FaClock } from 'react-icons/fa';

const API_BASE_URL = 'https://wh5u2vw3bi.execute-api.ap-south-1.amazonaws.com';

const DeliveryTrackOrderPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [etaMinutes, setEtaMinutes] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);

    const formatTime = (minutes) => {
        if (!minutes) return 'N/A';
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
                if (!res.ok) throw new Error('Failed to fetch order data.');
                const data = await res.json();
                setOrder(data);

                // Prepare coordinates
                const pharmacyCoords = [parseFloat(data.pharmacy.latitude), parseFloat(data.pharmacy.longitude)];
                const customerCoords = [parseFloat(data.latitude), parseFloat(data.longitude)];
                const deliveryPartnerCoords =
                    data.deliveryPartner?.latitude && data.deliveryPartner?.longitude
                        ? [parseFloat(data.deliveryPartner.latitude), parseFloat(data.deliveryPartner.longitude)]
                        : null;

                // Route coordinates array for OSRM (lon,lat)
                let coords = [pharmacyCoords];
                if (deliveryPartnerCoords) coords.push(deliveryPartnerCoords);
                coords.push(customerCoords);

                const coordString = coords.map(c => `${c[1]},${c[0]}`).join(';');
                const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

                const routeRes = await axios.get(url);
                if (routeRes.data?.routes?.length > 0) {
                    const routeGeoJSON = routeRes.data.routes[0].geometry.coordinates;
                    // OSRM returns [lon, lat], Leaflet expects [lat, lon]
                    const routeLatLng = routeGeoJSON.map(c => [c[1], c[0]]);
                    setRouteCoords(routeLatLng);

                    const durationSeconds = routeRes.data.routes[0].duration;
                    setEtaMinutes(Math.round(durationSeconds / 60));
                }
            } catch (error) {
                toast.error("Unable to load order details or ETA.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return <div className="loading-spinner">Loading Order Details...</div>;
    if (!order) return <div className="error-message">No order found for this ID.</div>;

    const pharmacyCoords = [parseFloat(order.pharmacy?.latitude), parseFloat(order.pharmacy?.longitude)];
    const customerCoords = [parseFloat(order.latitude), parseFloat(order.longitude)];
    const deliveryPartnerCoords =
        order.deliveryPartner?.latitude && order.deliveryPartner?.longitude
            ? [parseFloat(order.deliveryPartner.latitude), parseFloat(order.deliveryPartner.longitude)]
            : null;

    return (
        <div className="delivery-track-page">
            <header className="dtp-header">
                <h1>📦 Track Your Order</h1>
                <p><strong>Order ID:</strong> {order.orderId}</p>
                {['assigned', 'Out for Delivery'].includes(order.status) && (
                    <div className="eta-display">
                        <FaClock />
                        <span>
                            Estimated Arrival: <strong>{formatTime(etaMinutes)}</strong>
                        </span>
                    </div>
                )}
            </header>

            <div className="dtp-main-grid">
                <div className="dtp-details-panel">
                    <div className="address-card">
                        <FaWarehouse className="icon" />
                        <div>
                            <h4>Pickup From</h4>
                            <p>{order.pharmacy?.name || order.assignedPharmacyId}</p>
                            <p>{order.pharmacy?.address}</p>
                        </div>
                    </div>

                    <div className="address-card">
                        <FaUser className="icon" />
                        <div>
                            <h4>Deliver To</h4>
                            <p>{order.name}</p>
                            <p>{order.address}, {order.city}</p>
                        </div>
                    </div>

                    <div className="address-card">
                        <FaClock className="icon" />
                        <div>
                            <h4>Estimated Delivery Time</h4>
                            <p>{formatTime(etaMinutes)}</p>
                        </div>
                    </div>
                </div>

                <div className="dtp-map-panel">
                    <DeliveryOrderMap
                        pharmacyCoords={pharmacyCoords}
                        customerCoords={customerCoords}
                        deliveryPartnerCoords={deliveryPartnerCoords}
                        routeCoords={routeCoords}
                    />
                </div>
            </div>
        </div>
    );
};

export default DeliveryTrackOrderPage;
