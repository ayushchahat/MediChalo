import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import './DeliveryProfilePage.css';
import { FaEdit, FaTimes, FaSave, FaUserCircle, FaFilePdf } from 'react-icons/fa';

const DeliveryProfilePage = () => {
    const { user, fetchAndUpdateUser } = useContext(AuthContext);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [files, setFiles] = useState({});
    const [imagePreview, setImagePreview] = useState('');

    const serverUrl = 'https://medichalo-backend.onrender.com/';

    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name || '',
                phone: user.phone || '',
                vehicleDetails: user.deliveryProfile?.vehicleDetails || '',
            });
            setImagePreview(
                user.profileImage
                    ? `${serverUrl}${user.profileImage.replace(/\\/g, '/')}`
                    : ''
            );
        }
    }, [user]);

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles[0]) {
            setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
            if (name === 'profileImage') {
                setImagePreview(URL.createObjectURL(selectedFiles[0]));
            }
        }
    };

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(editData).forEach((key) => formData.append(key, editData[key]));
        Object.keys(files).forEach((key) => formData.append(key, files[key]));

        try {
            await api.put('/users/delivery-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Profile updated successfully!');
            await fetchAndUpdateUser();
            setIsEditMode(false);
        } catch (error) {
            toast.error('Failed to update profile.');
            console.error('Profile update error:', error);
        }
    };

    if (!user || !user.deliveryProfile)
        return <div className="loading-spinner">Loading Profile...</div>;

    const { deliveryProfile } = user;

    return (
        <div className="profile-page-container">
            <div className="profile-card">
                <div className="profile-card-header">
                    <div className="profile-image-container">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile" />
                        ) : (
                            <FaUserCircle className="placeholder-icon" />
                        )}
                    </div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="edit-toggle-btn"
                    >
                        {isEditMode ? (
                            <>
                                <FaTimes /> Cancel
                            </>
                        ) : (
                            <>
                                <FaEdit /> Edit Profile
                            </>
                        )}
                    </button>
                </div>

                {isEditMode ? (
                    <form onSubmit={handleSaveChanges} className="profile-edit-form">
                        <input
                            type="file"
                            name="profileImage"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                        />
                        <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
                        />
                        <input
                            type="text"
                            name="vehicleDetails"
                            value={editData.vehicleDetails}
                            onChange={handleInputChange}
                            placeholder="Vehicle Details (e.g., Bike - KL 01 AB 1234)"
                        />
                        <button type="submit" className="save-btn">
                            <FaSave /> Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="profile-details">
                        <h4>Contact Information</h4>
                        <p>
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p>
                            <strong>Phone:</strong> {user.phone || 'Not provided'}
                        </p>

                        <h4>Vehicle Details</h4>
                        <p>{deliveryProfile.vehicleDetails}</p>

                        <h4>Documents</h4>
                        {deliveryProfile.drivingLicensePath && (
                            <a
                                href={`${serverUrl}${deliveryProfile.drivingLicensePath.replace(
                                    /\\/g,
                                    '/'
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="document-link"
                            >
                                <FaFilePdf /> View Driving License
                            </a>
                        )}
                        {deliveryProfile.vehicleRegistrationPath && (
                            <a
                                href={`${serverUrl}${deliveryProfile.vehicleRegistrationPath.replace(
                                    /\\/g,
                                    '/'
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="document-link"
                            >
                                <FaFilePdf /> View Vehicle Registration
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryProfilePage;
