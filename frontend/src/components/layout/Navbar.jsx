import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CartContext from '../../context/CartContext';
import { FaMoon, FaSun, FaShoppingCart, FaClipboardList, FaBoxes, FaTimes, FaBars } from 'react-icons/fa';
import medichaloLogo from '../../assets/images/medichalo-logo.jpeg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Customer':
        return '/customer/dashboard';
      case 'Pharmacy':
        return '/pharmacy/dashboard';
      case 'DeliveryPartner':
        return '/delivery/dashboard';
      default:
        return '/';
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to={getDashboardLink()} className="nav-logo-link" onClick={closeMobileMenu}>
          <img src={medichaloLogo} alt="MediChalo Logo" className="nav-logo-img" />
          <span className="nav-logo-text">MediChalo</span>
        </Link>

        {/* Hamburger Menu */}
        <div className="menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Nav Links */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to={getDashboardLink()} className="nav-item" onClick={closeMobileMenu}>
                {t('dashboard')}
              </Link>

              {/* Customer Links */}
              {user.role === 'Customer' && (
                <>
                  <Link to="/customer/orders" className="nav-item" onClick={closeMobileMenu}>
                    <FaClipboardList /> Orders
                  </Link>
                  <Link to="/cart" className="nav-item cart-icon-link" onClick={closeMobileMenu}>
                    <FaShoppingCart />
                    {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                  </Link>
                </>
              )}

              {/* Pharmacy Links */}
              {user.role === 'Pharmacy' && (
                <>
                  <Link to="/pharmacy/inventory" className="nav-item" onClick={closeMobileMenu}>
                    <FaBoxes /> Manage Inventory
                  </Link>
                  <Link to="/pharmacy/orders" className="nav-item" onClick={closeMobileMenu}>
                    <FaClipboardList /> View Orders
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="nav-item nav-button-logout">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item nav-button" onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/signup" className="nav-item nav-button primary" onClick={closeMobileMenu}>
                Sign Up
              </Link>
            </>
          )}

          {/* Controls */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="nav-item language-select"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
          </select>

          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
