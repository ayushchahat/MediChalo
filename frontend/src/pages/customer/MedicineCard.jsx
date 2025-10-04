import React, { useContext } from 'react';
import CartContext from '../../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import './MedicineCard.css';

const MedicineCard = ({ medicine }) => {
    const { addToCart } = useContext(CartContext);
    const serverUrl = 'https://medichalo-backend.onrender.com/';

    return (
        <div className="medicine-card">
            <div className="medicine-image-container">
                <img 
                    src={`${serverUrl}${medicine.image}`} 
                    alt={medicine.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src=`${serverUrl}uploads/default-medicine.png`}}
                />
            </div>
            <div className="medicine-info">
                <h3>{medicine.name}</h3>
                <p className="pharmacy-name">From: {medicine.pharmacy.pharmacyProfile.shopName}</p>
                <div className="price-tag">${medicine.price.toFixed(2)}</div>
                <button onClick={() => addToCart(medicine)} className="add-to-cart-btn">
                    <FaShoppingCart /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default MedicineCard;
