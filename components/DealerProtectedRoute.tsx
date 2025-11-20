

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface DealerProtectedRouteProps {
  children: React.ReactElement;
}

const DealerProtectedRoute: React.FC<DealerProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login,
    // which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'dealer') {
    // If user is logged in but not a dealer, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default DealerProtectedRoute;