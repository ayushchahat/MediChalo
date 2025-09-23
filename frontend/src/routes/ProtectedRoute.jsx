import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified, check if the user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User role not allowed
    return <Navigate to="/" replace />; // Or to an 'unauthorized' page
  }
  
  // If logged in and role is okay (or no roles specified), render the child component
  return <Outlet />;
};

export default ProtectedRoute;