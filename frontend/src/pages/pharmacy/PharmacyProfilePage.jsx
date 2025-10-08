import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import './PharmacyProfilePage.css';
import { FaEdit, FaTimes, FaSave, FaFilePdf } from 'react-icons/fa';

const PharmacyProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [files, setFiles] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setProfile(data);

            // Initialize edit form if pharmacyProfile exists
            if (data.pharmacyProfile) {
                setEditData({
                    shopName: data.pharmacyProfile.shopName || '',
                    street: data.pharmacyProfile.address?.street || '',
                    city: data.pharmacyProfile.address?.city || '',
                    state: data.pharmacyProfile.address?.state || '',
                    zipCode: data.pharmacyProfile.address?.zipCode || '',
                    start: data.pharmacyProfile.workingHours?.start || '09:00',
                    end: data.pharmacyProfile.workingHours?.end || '18:00',
                });
            }
        } catch (error) {
            console.error("Fetch Profile Error:", error);
            toast.error("Could not fetch profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        const submissionData = new FormData();

        // Append text fields
        submissionData.append('shopName', editData.shopName);
        submissionData.append('start', editData.start);
        submissionData.append('end', editData.end);

        const address = {
            street: editData.street,
            city: editData.city,
            state: editData.state,
            zipCode: editData.zipCode
        };
        submissionData.append('address', JSON.stringify(address));

        // Append files
        Object.entries(files).forEach(([key, value]) => {
            if (value) submissionData.append(key, value);
        });

        try {
            await api.put('/users/pharmacy-profile', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
            setIsEditMode(false);
            setFiles({});
            fetchProfile();
        } catch (error) {
            console.error("Update Profile Error:", error);
            toast.error("Failed to update profile.");
        }
    };

    if (loading) return <div className="loading-spinner">Loading Profile...</div>;
    if (!profile || !profile.pharmacyProfile) return <div>Profile not found.</div>;

    const { pharmacyProfile, email } = profile;
    const serverUrl = 'http://localhost:5000/';

    const logoUrl = pharmacyProfile.logoPath
        ? `${serverUrl}${pharmacyProfile.logoPath.replace(/\\/g, '/')}`
        : `https://ui-avatars.com/api/?name=${pharmacyProfile.shopName?.charAt(0) || 'P'}&background=random&size=100`;

    return (
        <div className="profile-page-container">
            <div className="profile-header">
                <img src={logoUrl} alt="Shop Logo" className="profile-logo" />
                <div>
                    <h1>{pharmacyProfile.shopName || 'Unnamed Shop'}</h1>
                    <p>{email || 'No email provided'}</p>
                </div>
                <button onClick={() => setIsEditMode(!isEditMode)} className="edit-toggle-btn">
                    {isEditMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                </button>
            </div>

            {isEditMode ? (
                <form onSubmit={handleSaveChanges} className="profile-edit-form">
                    <div className="form-group">
                        <label>Shop Name</label>
                        <input type="text" name="shopName" value={editData.shopName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Street Address</label>
                        <input type="text" name="street" value={editData.street} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input type="text" name="city" value={editData.city} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input type="text" name="state" value={editData.state} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Zip Code</label>
                        <input type="text" name="zipCode" value={editData.zipCode} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Working Hours</label>
                        <div className="time-inputs">
                            <input type="time" name="start" value={editData.start} onChange={handleInputChange} />
                            <span>to</span>
                            <input type="time" name="end" value={editData.end} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Update Logo</label>
                        <input type="file" name="logo" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="form-group">
                        <label>Update License</label>
                        <input type="file" name="license" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </div>
                    <div className="form-group">
                        <label>Update GST</label>
                        <input type="file" name="gst" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </div>

                    <button type="submit" className="save-btn"><FaSave /> Save Changes</button>
                </form>
            ) : (
                <div className="profile-details-grid">
                    <div className="detail-card">
                        <h4>Shop Details</h4>
                        <p><strong>Name:</strong> {pharmacyProfile.shopName || 'N/A'}</p>
                        <p><strong>Address:</strong> {`${pharmacyProfile.address?.street || ''}, ${pharmacyProfile.address?.city || ''}, ${pharmacyProfile.address?.state || ''} - ${pharmacyProfile.address?.zipCode || ''}`}</p>
                        <p><strong>Working Hours:</strong> {pharmacyProfile.workingHours?.start || 'N/A'} to {pharmacyProfile.workingHours?.end || 'N/A'}</p>
                    </div>
                    <div className="detail-card">
                        <h4>Documents</h4>
                        {pharmacyProfile.licensePath && (
                            <a href={`${serverUrl}${pharmacyProfile.licensePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="document-link">
                                <FaFilePdf /> View License
                            </a>
                        )}
                        {pharmacyProfile.gstPath && (
                            <a href={`${serverUrl}${pharmacyProfile.gstPath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="document-link">
                                <FaFilePdf /> View GST
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyProfilePage;
