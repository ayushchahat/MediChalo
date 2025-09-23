import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { FaUserPlus, FaClinicMedical, FaMotorcycle, FaShieldAlt, FaLanguage, FaLock } from 'react-icons/fa';
import medichaloLogo from '../../assets/images/medichalo-logo.jpeg'; // Make sure the logo is in this path

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src={medichaloLogo} alt="MediChalo Logo" className="hero-logo" />
          <h1 className="hero-headline">Health in a Flash</h1>
          <p className="hero-subheadline">
            Connecting customers, pharmacies, and delivery partners for a seamless healthcare experience.
          </p>
          <Link to="/signup" className="hero-cta-button">Join Our Network</Link>
        </div>
      </section>

      {/* Role-Based "Join Us" Section */}
      <section className="join-us-section">
        <h2 className="section-title">Who Are You?</h2>
        <div className="role-cards-container">
          {/* Card for Customers */}
          <div className="role-card">
            <div className="role-icon-wrapper">
              <FaUserPlus className="role-icon" />
            </div>
            <h3>For Customers</h3>
            <p>Get your medicines delivered from trusted local pharmacies with just a few clicks. Fast, simple, and secure.</p>
            <Link to="/signup" className="role-card-link">Order Now</Link>
          </div>
          {/* Card for Pharmacies */}
          <div className="role-card">
            <div className="role-icon-wrapper">
              <FaClinicMedical className="role-icon" />
            </div>
            <h3>For Pharmacies</h3>
            <p>Expand your reach, manage your inventory with ease, and connect with more customers in your area.</p>
            <Link to="/signup" className="role-card-link">Register Your Pharmacy</Link>
          </div>
          {/* Card for Delivery Partners */}
          <div className="role-card">
            <div className="role-icon-wrapper">
              <FaMotorcycle className="role-icon" />
            </div>
            <h3>For Delivery Partners</h3>
            <p>Earn flexibly by delivering essential medicines. Be a vital part of the healthcare chain.</p>
            <Link to="/signup" className="role-card-link">Ride With Us</Link>
          </div>
        </div>
      </section>

      {/* Features Section (Kept general benefits) */}
      <section className="features-section">
        <h2 className="section-title">Why Choose MediChalo?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <FaShieldAlt className="feature-icon" />
            <h4>Verified & Trusted</h4>
            <p>We partner only with licensed pharmacies and verified delivery partners for your safety.</p>
          </div>
          <div className="feature-item">
            <FaLock className="feature-icon" />
            <h4>Secure & Private</h4>
            <p>Your health data is encrypted and handled with the utmost confidentiality.</p>
          </div>
          <div className="feature-item">
            <FaLanguage className="feature-icon" />
            <h4>Multi-Language Support</h4>
            <p>Use our app in English or Hindi for a comfortable and seamless experience.</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Experience Seamless Healthcare?</h2>
        <p>Join thousands of users who trust MediChalo for their medicinal needs.</p>
        <Link to="/signup" className="cta-button-final">Sign Up for Free</Link>
      </section>
    </div>
  );
};

export default HomePage;

