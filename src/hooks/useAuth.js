// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Standalone API utilities
export const loginRequest = ({ email, password }) =>
  axiosInstance.post(API_ENDPOINTS.LOGIN, { email, password }, {
    withCredentials: true
  });

export const fetchCurrentUser = () =>
  axiosInstance.get(API_ENDPOINTS.USER_INFO, {
    withCredentials: true
  }).then(res => res.data.data);

export const logoutRequest = () =>
  axiosInstance.post(API_ENDPOINTS.AUTH_LOGOUT, {}, { withCredentials: true });

// React hook for auth state
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthStatus = async () => {
    if (location.pathname === '/login') {
      setIsLoading(false);
      return;
    }
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      setIsAuthenticated(true);
      setIsAdmin(u.companyRole === 'ADMIN');
    } catch (err) {
      console.error('인증 확인 오류', err);
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      await loginRequest({ email, password });
      const u = await fetchCurrentUser();
      setUser(u);
      setIsAuthenticated(true);
      const adminStatus = u.companyRole === 'ADMIN';
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        navigate('/dashboard-admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('로그인 오류', err);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      // API 호출 성공 여부와 관계없이 토큰 제거 및 상태 초기화
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  return { user, isAuthenticated, isLoading, isAdmin, login, logout, userId: user?.id };
};
