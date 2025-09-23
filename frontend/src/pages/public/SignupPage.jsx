import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaUserAlt, FaEnvelope, FaPhone, FaLock, FaUsers } from 'react-icons/fa';
import logo from '../../assets/images/medichalo-logo.jpeg';
import '../../assets/styles/AuthForm.css'; // Use the shared stylesheet

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'Customer'
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/signup', formData);
            toast.success('Signup successful! Please log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-card">
                <div className="auth-header">
                    <img src={logo} alt="MediChalo Logo" className="auth-logo" />
                    <h2>Create an Account</h2>
                    <p>Join MediChalo today!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FaUserAlt className="input-icon" />
                        <input name="name" className="auth-input" placeholder="Full Name" onChange={handleChange} required />
                    </div>
                    
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input name="email" type="email" className="auth-input" placeholder="Email Address" onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <FaPhone className="input-icon" />
                        <input name="phone" type="tel" className="auth-input" placeholder="Phone Number" onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input name="password" type="password" className="auth-input" placeholder="Password" onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <FaUsers className="input-icon" />
                        <select name="role" value={formData.role} onChange={handleChange} className="auth-input">
                            <option value="Customer">I am a Customer</option>
                            <option value="Pharmacy">I am a Pharmacy</option>
                            <option value="DeliveryPartner">I am a Delivery Partner</option>
                        </select>
                    </div>

                    <button type="submit" className="auth-button">Sign Up</button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
