import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const DeliveryOrderMap = ({ pharmacyLocation, customerLocation }) => {
    return (
        <MapContainer 
            center={customerLocation} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            bounds={[pharmacyLocation, customerLocation]}
            boundsOptions={{ padding: [50, 50] }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={pharmacyLocation}>
                <Popup>Pickup: Pharmacy</Popup>
            </Marker>
            <Marker position={customerLocation}>
                <Popup>Delivery: Customer</Popup>
            </Marker>
        </MapContainer>
    );
};

export default DeliveryOrderMap;
