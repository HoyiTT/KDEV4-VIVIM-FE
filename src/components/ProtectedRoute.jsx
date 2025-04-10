import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, authRequired = true }) => {
  const token = localStorage.getItem('token');

  if (!token && authRequired) {
    return <Navigate to="/" replace />;
  }

  if (token && !authRequired) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
