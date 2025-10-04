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
import CartPage from '../pages/customer/CartPage';
import TrackOrderPage from '../pages/customer/TrackOrderPage'; // New import

// Pharmacy Pages
import PharmacyDashboard from '../pages/pharmacy/PharmacyDashboard';
import OnboardingPage from '../pages/pharmacy/OnboardingPage';
import AddMedicinePage from '../pages/pharmacy/AddMedicinePage';
import InventoryPage from '../pages/pharmacy/InventoryPage';
import ManageOrdersPage from '../pages/pharmacy/ManageOrdersPage';

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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders" element={<OrderHistoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/track-order/:orderId" element={<TrackOrderPage />} /> {/* Track Order */}

            {/* Pharmacy Routes */}
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/onboarding" element={<OnboardingPage />} />
            <Route path="/pharmacy/add-medicine" element={<AddMedicinePage />} />
            <Route path="/pharmacy/inventory" element={<InventoryPage />} />
            <Route path="/pharmacy/orders" element={<ManageOrdersPage />} />

            {/* Delivery Partner Routes */}
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/onboarding" element={<DeliveryOnboardingPage />} />
            <Route path="/delivery/history" element={<DeliveryHistoryPage />} />
            <Route path="/delivery/earnings" element={<DeliveryEarningsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </main>
    </>
  );
};

export default AppRouter;
