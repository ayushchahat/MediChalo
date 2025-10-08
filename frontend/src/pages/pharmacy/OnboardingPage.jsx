import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import '../../assets/styles/OnboardingPage.css';

const OnboardingPage = () => {
    const [formData, setFormData] = useState({
        shopName: '',
        start: '09:00',
        end: '18:00',
        offDays: [],
        // NEW: Nested address object instead of lat/lng
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
        }
    });
    const [files, setFiles] = useState({
        license: null,
        gst: null,
        logo: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // NEW: Handler for the nested address state
    const handleAddressChange = (e) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            offDays: prev.offDays.includes(day)
                ? prev.offDays.filter(d => d !== day)
                : [...prev.offDays, day]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const submissionData = new FormData();

        // Append all form data, stringifying objects
        submissionData.append('shopName', formData.shopName);
        submissionData.append('start', formData.start);
        submissionData.append('end', formData.end);
        submissionData.append('offDays', JSON.stringify(formData.offDays));
        // Stringify the address object to send it as a single field
        submissionData.append('address', JSON.stringify(formData.address)); 
        
        Object.entries(files).forEach(([key, value]) => {
            if (value) submissionData.append(key, value);
        });

        try {
            await api.put('/users/onboarding', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile created successfully!");
            navigate('/pharmacy/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <h1>Complete Your Pharmacy Profile</h1>
                <p>This information is required to access your dashboard and start receiving orders.</p>
                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label>Shop Name</label>
                        <input type="text" name="shopName" onChange={handleChange} required />
                    </div>

                    {/* UPDATED: Full Address Form */}
                    <div className="form-group">
                        <label htmlFor="street">Street Address</label>
                        <input type="text" name="street" placeholder="e.g., 123 MG Road" value={formData.address.street} onChange={handleAddressChange} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input type="text" name="city" placeholder="e.g., Thiruvananthapuram" value={formData.address.city} onChange={handleAddressChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input type="text" name="state" placeholder="e.g., Kerala" value={formData.address.state} onChange={handleAddressChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="zipCode">Zip Code</label>
                        <input type="text" name="zipCode" placeholder="e.g., 695001" value={formData.address.zipCode} onChange={handleAddressChange} required />
                    </div>

                    <div className="form-group">
                        <label>Working Hours</label>
                        <div className="time-inputs">
                            <input type="time" name="start" value={formData.start} onChange={handleChange} />
                            <span>to</span>
                            <input type="time" name="end" value={formData.end} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Weekly Off Days</label>
                        <div className="days-selector">
                            {weekDays.map(day => (
                                <button type="button" key={day} className={`day-btn ${formData.offDays.includes(day) ? 'selected' : ''}`} onClick={() => handleDayToggle(day)}>
                                    {day.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>License Document (PDF/Image)</label>
                        <input type="file" name="license" onChange={handleFileChange} required accept="image/*,application/pdf"/>
                    </div>
                    <div className="form-group">
                        <label>GST Document (PDF/Image)</label>
                        <input type="file" name="gst" onChange={handleFileChange} required accept="image/*,application/pdf"/>
                    </div>
                    <div className="form-group">
                        <label>Shop Logo (Optional)</label>
                        <input type="file" name="logo" onChange={handleFileChange} accept="image/*"/>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingPage;

