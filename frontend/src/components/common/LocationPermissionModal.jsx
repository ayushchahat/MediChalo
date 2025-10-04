import React from 'react';
import './LocationPermissionModal.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationPermissionModal = ({ isOpen, onPermission }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content location-modal">
                <FaMapMarkerAlt className="location-icon" />
                <h2>Share Your Location</h2>
                <p>To enhance your experience and enable delivery features, MediChalo needs to know your location. This is a one-time request.</p>
                <div className="modal-actions">
                    <button className="modal-btn deny" onClick={() => onPermission(false)}>Not Now</button>
                    <button className="modal-btn allow" onClick={() => onPermission(true)}>Allow Location</button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;
