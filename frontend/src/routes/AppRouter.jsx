import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Navbar from '../components/layout/Navbar';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import SignupPage from '../pages/public/SignupPage';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';

// Pharmacy Pages
import PharmacyDashboard from '../pages/pharmacy/PharmacyDashboard';
import PharmacyOnboardingPage from '../pages/pharmacy/OnboardingPage';

// Delivery Partner Pages
import DeliveryDashboard from '../pages/delivery/DeliveryDashboard';
import DeliveryOnboardingPage from '../pages/delivery/OnboardingPage';
import DeliveryHistoryPage from '../pages/delivery/HistoryPage';
import DeliveryEarningsPage from '../pages/delivery/EarningsPage';

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ================= PROTECTED ROUTES ================= */}
          <Route element={<ProtectedRoute />}>

            {/* --- Customer Routes --- */}
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders" element={<OrderHistoryPage />} />

            {/* --- Pharmacy Routes --- */}
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/onboarding" element={<PharmacyOnboardingPage />} />
            {/* Future: inventory, orders, reports routes */}

            {/* --- Delivery Partner Routes --- */}
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/onboarding" element={<DeliveryOnboardingPage />} />
            <Route path="/delivery/history" element={<DeliveryHistoryPage />} />
            <Route path="/delivery/earnings" element={<DeliveryEarningsPage />} />

          </Route>

          {/* ================= CATCH-ALL ROUTE ================= */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </main>
    </>
  );
};

export default AppRouter;
