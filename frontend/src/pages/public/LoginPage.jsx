import React, { useState, useEffect } from 'react';
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
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [loginResponseData, setLoginResponseData] = useState(null);

    // 🔹 Redirect when user is updated
    useEffect(() => {
        if (user && loginResponseData) {
            const role = loginResponseData.role.toLowerCase();

            if (role === 'pharmacy' && !loginResponseData.pharmacyProfile?.onboardingComplete) {
                navigate('/pharmacy/onboarding');
            } else if (role === 'deliverypartner' && !loginResponseData.deliveryProfile?.onboardingComplete) {
                navigate('/delivery/onboarding');
            } else {
                let pathRole = role;
                if (role === 'deliverypartner') pathRole = 'delivery';
                navigate(`/${pathRole}/dashboard`);
            }
        }
    }, [user, loginResponseData, navigate]);

    /**
     * Handles location permission modal response
     */
    const handleLocationPermission = (granted) => {
        setShowLocationModal(false);

        if (granted) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await api.put('/users/location', { latitude, longitude });
                        toast.success('Location saved!');
                    } catch (err) {
                        toast.error('Could not save location. Proceeding anyway.');
                    }
                },
                () => {
                    toast.warn('Could not get location. You can set it later.');
                }
            );
        } else {
            toast.info('You can set your location in your profile later.');
        }
    };

    /**
     * Handles login form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });

            // Save JWT token (triggers AuthContext to fetch user)
            login(data.token);

            // Store data for redirect once user state updates
            setLoginResponseData(data);

            toast.success('Logged in successfully!');

            // Show location modal if location not captured
            if (!data.locationCaptured) {
                setShowLocationModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
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
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-link">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
