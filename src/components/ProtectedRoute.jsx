import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, authRequired = true }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때는 아무것도 렌더링하지 않음
  if (isLoading) {
    return null;
  }

  // 인증된 사용자가 로그인 페이지에 접근하면 대시보드로 리다이렉트
  if (location.pathname === '/login' && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 인증이 필요한 페이지에 인증되지 않은 사용자가 접근하면 로그인 페이지로 리다이렉트
  if (!isAuthenticated && authRequired) {
    return <Navigate to="/login" replace />;
  }

  // 인증이 필요없는 페이지에 인증된 사용자가 접근하면 대시보드로 리다이렉트
  if (isAuthenticated && !authRequired) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
