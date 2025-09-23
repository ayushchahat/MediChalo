import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import './OnboardingPage.css'; // We'll create this stylesheet

const DeliveryOnboardingPage = () => {
    const [formData, setFormData] = useState({ vehicleDetails: '' });
    const [files, setFiles] = useState({ drivingLicense: null, vehicleRegistration: null });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        submissionData.append('vehicleDetails', formData.vehicleDetails);
        if (files.drivingLicense) submissionData.append('drivingLicense', files.drivingLicense);
        if (files.vehicleRegistration) submissionData.append('vehicleRegistration', files.vehicleRegistration);

        try {
            await api.put('/users/onboarding', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile created! Redirecting to dashboard...");
            navigate('/delivery/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create profile.');
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <h1>Complete Your Delivery Profile</h1>
                <p>This is required to access your dashboard and start accepting deliveries.</p>
                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label>Vehicle Details (e.g., "Honda Activa - MH 12 AB 3456")</label>
                        <input type="text" name="vehicleDetails" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Driver’s License (PDF/Image)</label>
                        <input type="file" name="drivingLicense" onChange={handleFileChange} required accept="image/*,application/pdf"/>
                    </div>
                    <div className="form-group">
                        <label>Vehicle Registration (PDF/Image)</label>
                        <input type="file" name="vehicleRegistration" onChange={handleFileChange} required accept="image/*,application/pdf"/>
                    </div>
                    <button type="submit" className="submit-btn">Save and Continue</button>
                </form>
            </div>
        </div>
    );
};
export default DeliveryOnboardingPage;
