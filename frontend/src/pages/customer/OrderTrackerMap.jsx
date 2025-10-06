import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// =======================
// 🧭 Custom Icons
// =======================
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/11469/11469451.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// =======================
// 🗺️ FitBounds Component
// =======================
const FitBounds = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && map) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  return null;
};

// =======================
// 🚗 OrderTrackerMap Component
// =======================
const OrderTrackerMap = ({ pharmacyLocation, customerLocation }) => {
  const [route, setRoute] = useState([]);

  // ✅ useMemo to stabilize values (fixes dependency warnings)
  const safePharmacy = useMemo(() => {
    if (pharmacyLocation?.latitude && pharmacyLocation?.longitude) {
      return { lat: Number(pharmacyLocation.latitude), lng: Number(pharmacyLocation.longitude) };
    }
    return null;
  }, [pharmacyLocation]);

  const safeCustomer = useMemo(() => {
    if (customerLocation?.latitude && customerLocation?.longitude) {
      return { lat: Number(customerLocation.latitude), lng: Number(customerLocation.longitude) };
    }
    return null;
  }, [customerLocation]);

  const defaultCenter = [8.5241, 76.9366]; // Thiruvananthapuram fallback

  // ✅ useMemo for stable bounds object
  const bounds = useMemo(() => {
    if (safePharmacy && safeCustomer) {
      return L.latLngBounds([
        [safePharmacy.lat, safePharmacy.lng],
        [safeCustomer.lat, safeCustomer.lng],
      ]);
    }
    return null;
  }, [safePharmacy, safeCustomer]);

  // ✅ Fetch route from OSRM safely
  useEffect(() => {
    if (safePharmacy && safeCustomer) {
      const url = `https://router.project-osrm.org/route/v1/driving/${safePharmacy.lng},${safePharmacy.lat};${safeCustomer.lng},${safeCustomer.lat}?overview=full&geometries=geojson`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes?.length) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setRoute(coords);
          } else {
            console.warn('No route found between these points');
            setRoute([]);
          }
        })
        .catch((err) => {
          console.error('Error fetching route:', err);
          setRoute([]);
        });
    }
  }, [safePharmacy, safeCustomer]);

  return (
    <MapContainer
      center={
        bounds ? bounds.getCenter() : safeCustomer ? [safeCustomer.lat, safeCustomer.lng] : defaultCenter
      }
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      {/* Base map layer */}
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

      {/* Route Polyline */}
      {route.length > 0 && <Polyline positions={route} color="blue" weight={4} />}

      {/* Fit bounds dynamically */}
      {bounds && <FitBounds bounds={bounds} />}
    </MapContainer>
  );
};

export default OrderTrackerMap;
