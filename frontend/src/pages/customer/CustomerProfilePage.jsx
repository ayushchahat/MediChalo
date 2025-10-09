import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext'; // Import context to update user globally
import './CustomerProfilePage.css';
import { FaEdit, FaTimes, FaSave, FaUserCircle } from 'react-icons/fa';

const CustomerProfilePage = () => {
    const { user, fetchAndUpdateUser } = useContext(AuthContext); // Use global user state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name || '',
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zipCode: user.address?.zipCode || '',
            });
            setImagePreview(user.profileImage ? `https://medichalo-backend.onrender.com/${user.profileImage.replace(/\\/g, '/')}` : '');
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', editData.name);
        formData.append('phone', editData.phone);
        const address = { street: editData.street, city: editData.city, state: editData.state, zipCode: editData.zipCode };
        formData.append('address', JSON.stringify(address));
        if (profileImageFile) {
            formData.append('profileImage', profileImageFile);
        }

        try {
            await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
            await fetchAndUpdateUser(); // Re-fetch user data to update context and navbar
            setIsEditMode(false);
        } catch (error) {
            toast.error("Failed to update profile.");
        }
    };

    if (!user) return <div className="loading-spinner">Loading Profile...</div>;

    return (
        <div className="customer-profile-page">
            <div className="profile-card">
                <div className="profile-card-header">
                    <div className="profile-image-container">
                        {imagePreview ? <img src={imagePreview} alt="Profile" /> : <FaUserCircle className="placeholder-icon" />}
                    </div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <button onClick={() => setIsEditMode(!isEditMode)} className="edit-toggle-btn">
                        {isEditMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                    </button>
                </div>
                
                {isEditMode ? (
                    <form onSubmit={handleSaveChanges} className="profile-edit-form">
                        <input type="file" name="profileImage" onChange={handleFileChange} accept="image/*" />
                        <input type="text" name="name" value={editData.name} onChange={handleInputChange} placeholder="Full Name" />
                        <input type="text" name="phone" value={editData.phone} onChange={handleInputChange} placeholder="Phone Number" />
                        <input type="text" name="street" value={editData.street} onChange={handleInputChange} placeholder="Street Address" />
                        <input type="text" name="city" value={editData.city} onChange={handleInputChange} placeholder="City" />
                        <button type="submit" className="save-btn"><FaSave /> Save Changes</button>
                    </form>
                ) : (
                    <div className="profile-details">
                        <h4>Contact Information</h4>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                        <h4>Shipping Address</h4>
                        <p>{user.address?.street ? `${user.address.street}, ${user.address.city}` : 'Not provided'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerProfilePage;
