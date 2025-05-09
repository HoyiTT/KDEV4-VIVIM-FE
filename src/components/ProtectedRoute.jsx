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

  return children;
};

export default ProtectedRoute;
