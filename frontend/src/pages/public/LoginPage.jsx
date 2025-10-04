import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaUserAlt, FaLock } from 'react-icons/fa';
import logo from '../../assets/images/medichalo-logo.jpeg';
import LocationPermissionModal from '../../components/common/LocationPermissionModal';
import '../../assets/styles/AuthForm.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [loginResponseData, setLoginResponseData] = useState(null);

    // Handles final redirection after login and any onboarding checks
    const proceedToApp = (data) => {
        const role = data.role.toLowerCase();
        if (role === 'pharmacy' && !data.pharmacyProfile?.onboardingComplete) {
            navigate('/pharmacy/onboarding');
        } else if (role === 'deliverypartner' && !data.deliveryProfile?.onboardingComplete) {
            navigate('/delivery/onboarding');
        } else {
            navigate(`/${role}/dashboard`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token); // Save JWT in auth context/localStorage
            toast.success('Logged in successfully!');

            if (!data.locationCaptured) {
                // Show location modal if location not yet captured
                setLoginResponseData(data);
                setShowLocationModal(true);
            } else {
                // Proceed directly if location already exists
                proceedToApp(data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    const handleLocationPermission = (granted) => {
        setShowLocationModal(false);
        if (granted) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await api.put('/users/location', { latitude, longitude });
                        toast.success('Location saved!');
                        proceedToApp(loginResponseData);
                    } catch (error) {
                        toast.error('Could not save location. Proceeding anyway.');
                        proceedToApp(loginResponseData);
                    }
                },
                () => {
                    toast.warn('Could not get location. You can set it later.');
                    proceedToApp(loginResponseData);
                }
            );
        } else {
            toast.info('You can set your location in your profile later.');
            proceedToApp(loginResponseData);
        }
    };

    return (
        <>
            <LocationPermissionModal
                isOpen={showLocationModal}
                onPermission={handleLocationPermission}
            />
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
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="auth-button">
                            Login
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
