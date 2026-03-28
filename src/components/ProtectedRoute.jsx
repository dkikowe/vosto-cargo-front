import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to start page instead of non-existent login page
    return <Navigate to="/start" replace />; 
  }

  if (allowedRoles && user?.role) {
    const userRole = user.role.toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());
    
    if (!allowed.includes(userRole)) {
      // Redirect to a default page based on their actual role, or home
      return <Navigate to="/home" replace />;
    }
  } else if (allowedRoles && !user?.role) {
     return <Navigate to="/start" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
