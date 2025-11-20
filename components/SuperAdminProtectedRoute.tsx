import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SuperAdminProtectedRouteProps {
  children: React.ReactElement;
}

const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SuperAdminProtectedRoute;