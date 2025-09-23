import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaUserAlt, FaLock } from 'react-icons/fa';
import logo from '../../assets/images/medichalo-logo.jpeg';
import '../../assets/styles/AuthForm.css'; // Import the new shared stylesheet

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token);
            toast.success('Logged in successfully!');
            
            const role = response.data.role.toLowerCase();
            navigate(`/${role}/dashboard`);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-card">
                <div className="auth-header">
                    <img src={logo} alt="MediChalo Logo" className="auth-logo" />
                    <h2>Welcome Back!</h2>
                    <p>Log in to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FaUserAlt className="input-icon" />
                        <input 
                            type="email" 
                            className="auth-input"
                            placeholder="Email Address" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input 
                            type="password" 
                            className="auth-input"
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="auth-options">
                        <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="auth-button">Login</button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
