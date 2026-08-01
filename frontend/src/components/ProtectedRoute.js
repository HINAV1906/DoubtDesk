import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Props:
 *   children — component to render if access is allowed
 *   role     — 'student' | 'faculty' | 'admin' | undefined (any authenticated user)
 */
const ProtectedRoute = ({ children, role }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole   = localStorage.getItem('role');

  // Not logged in → back to login
  if (!isLoggedIn) return <Navigate to="/" replace />;

  // Wrong role → redirect to their correct home
  if (role && userRole !== role) {
    if (userRole === 'faculty') return <Navigate to="/faculty"  replace />;
    if (userRole === 'admin')   return <Navigate to="/admin-profile" replace />;
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
