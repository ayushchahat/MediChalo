import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix default icon issues in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// Routing Component with safe removeControl
const Routing = ({ from, to }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map || !L.Routing) return;

    // Remove previous routing safely
    if (routingRef.current) {
      try {
        map.removeControl(routingRef.current);
      } catch (err) {
        console.warn('Safe removeControl skipped:', err);
      }
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
      addWaypoints: false,
      routeWhileDragging: false,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    routingRef.current = routingControl;

    // Fit map bounds to show both markers
    const bounds = L.latLngBounds([L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (routingRef.current) {
        try {
          map.removeControl(routingRef.current);
        } catch (err) {
          console.warn('Safe removeControl skipped on cleanup:', err);
        }
      }
    };
  }, [from, to, map]);

  return null;
};

const OrderTrackerMap = ({ pharmacyLocation, customerLocation }) => {
  // Convert strings to numbers safely
  const safePharmacy =
    pharmacyLocation && pharmacyLocation.latitude && pharmacyLocation.longitude
      ? { lat: Number(pharmacyLocation.latitude), lng: Number(pharmacyLocation.longitude) }
      : null;

  const safeCustomer =
    customerLocation && customerLocation.latitude && customerLocation.longitude
      ? { lat: Number(customerLocation.latitude), lng: Number(customerLocation.longitude) }
      : null;

  // Default center fallback
  const mapCenter =
    safeCustomer || safePharmacy
      ? [safeCustomer?.lat || safePharmacy.lat, safeCustomer?.lng || safePharmacy.lng]
      : [8.5241, 76.9366]; // Thiruvananthapuram

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />

      {/* Pharmacy Marker */}
      {safePharmacy && (
        <Marker position={[safePharmacy.lat, safePharmacy.lng]} icon={pharmacyIcon}>
          <Popup>Pharmacy Location</Popup>
        </Marker>
      )}

      {/* Customer Marker */}
      {safeCustomer && (
        <Marker position={[safeCustomer.lat, safeCustomer.lng]} icon={customerIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {/* Routing */}
      {safePharmacy && safeCustomer && <Routing from={safePharmacy} to={safeCustomer} />}
    </MapContainer>
  );
};

export default OrderTrackerMap;
