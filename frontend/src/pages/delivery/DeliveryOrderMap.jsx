import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Fit map to bounds
const FitBounds = ({ coords }) => {
    const map = useMap();

    useEffect(() => {
        const validCoords = coords.filter(
            (c) => Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1])
        );
        if (validCoords.length > 0) {
            map.fitBounds(L.latLngBounds(validCoords), { padding: [50, 50] });
        }
    }, [coords, map]);

    return null;
};

const DeliveryOrderMap = ({ pharmacyCoords, customerCoords, deliveryPartnerCoords, routeCoords }) => {
    // Prepare markers
    const markers = [];

    if (pharmacyCoords?.length === 2 && !isNaN(pharmacyCoords[0]) && !isNaN(pharmacyCoords[1])) {
        markers.push({ position: pharmacyCoords, label: 'Pharmacy' });
    }

    if (deliveryPartnerCoords?.length === 2 && !isNaN(deliveryPartnerCoords[0]) && !isNaN(deliveryPartnerCoords[1])) {
        markers.push({ position: deliveryPartnerCoords, label: 'Delivery Partner' });
    }

    if (customerCoords?.length === 2 && !isNaN(customerCoords[0]) && !isNaN(customerCoords[1])) {
        markers.push({ position: customerCoords, label: 'Customer' });
    }

    // Default center
    const defaultCenter = [20.5937, 78.9629];
    const center = markers.length > 0 ? markers[0].position : defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {markers.map((m, idx) => (
                <Marker key={idx} position={m.position}>
                    <Popup>{m.label}</Popup>
                </Marker>
            ))}

            {routeCoords && routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="blue" weight={4} />
            )}

            <FitBounds coords={markers.map(m => m.position)} />
        </MapContainer>
    );
};

export default DeliveryOrderMap;
