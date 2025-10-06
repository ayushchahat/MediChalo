import React, { useContext } from 'react';
import CartContext from '../../context/CartContext';
import { FaShoppingCart, FaClock } from 'react-icons/fa';
import { calculateETAMinutes } from '../../utils/etaCalculator'; // ETA utility
import './MedicineCard.css';

const MedicineCard = ({ medicine, customerLocation }) => {
    const { addToCart } = useContext(CartContext);
    const serverUrl = 'https://medichalo-backend.onrender.com/';

    // Extract pharmacy location safely
    const pharmacyLocation = medicine?.pharmacy?.pharmacyProfile?.location?.coordinates;

    // Calculate ETA (Estimated Time of Arrival)
    const eta = customerLocation && pharmacyLocation
        ? calculateETAMinutes(pharmacyLocation, customerLocation)
        : null;

    return (
        <div className="medicine-card">
            <div className="medicine-image-container">
                <img
                    src={`${serverUrl}${medicine.image?.replace(/\\/g, '/')}`}
                    alt={medicine.name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${serverUrl}uploads/default-medicine.png`;
                    }}
                />

                {/* ETA Badge (if applicable) */}
                {eta && (
                    <div className="eta-badge">
                        <FaClock className="eta-icon" /> {eta}
                    </div>
                )}
            </div>

            <div className="medicine-info">
                <h3>{medicine.name}</h3>

                {/* Pharmacy Info */}
                <p className="pharmacy-name">
                    From: {medicine.pharmacy?.pharmacyProfile?.shopName || 'Local Pharmacy'}
                </p>

                {/* Price */}
                <div className="price-tag">₹{medicine.price?.toFixed(2) || 'N/A'}</div>

                {/* Add to Cart Button */}
                <button onClick={() => addToCart(medicine)} className="add-to-cart-btn">
                    <FaShoppingCart /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default MedicineCard;
