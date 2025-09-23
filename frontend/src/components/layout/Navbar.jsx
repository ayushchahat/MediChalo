import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../assets/images/medichalo-logo.jpeg'; // Import the logo
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false); // Close menu on logout
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!user) return "/";
        switch (user.role) {
            case 'Customer': return '/customer/dashboard';
            case 'Pharmacy': return '/pharmacy/dashboard';
            case 'DeliveryPartner': return '/delivery/dashboard';
            default: return '/';
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to={getDashboardLink()} className="nav-logo" onClick={closeMobileMenu}>
                    <img src={logo} alt="MediChalo Logo" className="nav-logo-img" />
                    <span>MediChalo</span>
                </Link>

                <div className="menu-icon" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <div className={isMobileMenuOpen ? "nav-menu active" : "nav-menu"}>
                    {user ? (
                        <>
                            <Link to={getDashboardLink()} className="nav-item" onClick={closeMobileMenu}>{t('dashboard')}</Link>
                            <button onClick={handleLogout} className="nav-item nav-button">{t('logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item nav-button" onClick={closeMobileMenu}>{t('login')}</Link>
                            <Link to="/signup" className="nav-item nav-button" onClick={closeMobileMenu}>{t('signup')}</Link>
                        </>
                    )}

                    <div className="nav-controls">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
                            <option value="en">EN</option>
                            <option value="hi">HI</option>
                        </select>
                        <button onClick={toggleTheme} className="theme-toggle">
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

