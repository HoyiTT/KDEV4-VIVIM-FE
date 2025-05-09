import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;

const ProtectedRoute = ({ children, authRequired = true }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

  if (isLoading) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  // 인증된 사용자가 로그인 페이지에 접근하면 대시보드로 리다이렉트
  if (location.pathname === '/login' && isAuthenticated) {
    return <Navigate to={isAdmin ? "/dashboard-admin" : "/dashboard"} replace />;
  }

  // 인증이 필요한 페이지에 인증되지 않은 사용자가 접근하면 로그인 페이지로 리다이렉트
  if (!isAuthenticated && authRequired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
