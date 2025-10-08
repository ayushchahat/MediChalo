import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet's CSS is imported

const DeliveryOrderMap = ({ pharmacyLocation, customerLocation }) => {
    // Define the path for the polyline, connecting the two locations
    const routeCoordinates = [pharmacyLocation, customerLocation];

    // Define styling options for the route line
    const routeOptions = { color: '#1d4ed8', weight: 5, opacity: 0.7 };

    return (
        <MapContainer
            bounds={routeCoordinates} // Automatically zoom and center to fit both points
            boundsOptions={{ padding: [50, 50] }} // Add padding around the bounds
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Marker for the pharmacy location */}
            <Marker position={pharmacyLocation}>
                <Popup>Pickup From: Pharmacy</Popup>
            </Marker>
            
            {/* Marker for the customer location */}
            <Marker position={customerLocation}>
                <Popup>Deliver To: Customer</Popup>
            </Marker>

            {/* NEW: Polyline to draw the route on the map */}
            <Polyline pathOptions={routeOptions} positions={routeCoordinates} />
        </MapContainer>
    );
};

export default DeliveryOrderMap;

