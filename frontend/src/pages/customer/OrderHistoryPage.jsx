import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Component to fit map bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  return null;
};

const OrderTrackerMap = ({ pharmacyLocation, customerLocation }) => {
  const [route, setRoute] = useState([]);

  // Default center
  const defaultCenter = [8.5241, 76.9366]; // Thiruvananthapuram

  // Generate bounds
  const bounds =
    pharmacyLocation && customerLocation
      ? L.latLngBounds([
          [pharmacyLocation.lat, pharmacyLocation.lng],
          [customerLocation.lat, customerLocation.lng],
        ])
      : null;

  // Fetch route using OSRM
  useEffect(() => {
    if (pharmacyLocation && customerLocation) {
      const url = `https://router.project-osrm.org/route/v1/driving/${pharmacyLocation.lng},${pharmacyLocation.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
            setRoute(coords);
          }
        })
        .catch(console.error);
    }
  }, [pharmacyLocation, customerLocation]);

  return (
    <MapContainer
      center={customerLocation || defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />

      {pharmacyLocation && (
        <Marker position={[pharmacyLocation.lat, pharmacyLocation.lng]} icon={pharmacyIcon}>
          <Popup>Pharmacy Location</Popup>
        </Marker>
      )}

      {customerLocation && (
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {route.length > 0 && <Polyline positions={route} color="blue" weight={4} />}

      {bounds && <FitBounds bounds={bounds} />}
    </MapContainer>
  );
};

export default OrderTrackerMap;
