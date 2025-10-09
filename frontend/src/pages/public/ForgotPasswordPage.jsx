import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaEnvelope } from 'react-icons/fa';
import logo from '../../assets/images/medichalo-logo.jpeg';
import '../../assets/styles/AuthForm.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            toast.success(data.message);
            setIsSubmitted(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-card">
                <div className="auth-header">
                    <img src={logo} alt="MediChalo Logo" className="auth-logo" />
                    <h2>Forgot Your Password?</h2>
                    <p>No problem. Enter your email below to receive a reset link.</p>
                </div>

                {isSubmitted ? (
                    <div className="form-success-message">
                        <p>Please check your email inbox for the password reset link.</p>
                        <Link to="/login" className="auth-link">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">Send Reset Link</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
