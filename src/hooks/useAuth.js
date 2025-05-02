import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthStatus = async () => {
    // 로그인 페이지에서는 인증 상태 확인을 건너뜁니다
    if (location.pathname === '/login') {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.USER_INFO, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('인증되지 않은 상태입니다.');
      }

      const result = await response.json();
      console.log('사용자 정보 응답:', result);

      if (!result.data) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 서버에서 반환한 사용자 정보 설정
      const userInfo = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        phone: result.data.phone,
        companyName: result.data.companyName,
        companyRole: result.data.companyRole
      };

      console.log('인증된 사용자 정보:', userInfo);
      setUser(userInfo);
      setIsAuthenticated(true);
      setIsAdmin(userInfo.companyRole === 'ADMIN');
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (location.pathname !== '/login') {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      console.log('로그인 API 호출:', { email });
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log('로그인 응답:', result);

      if (!response.ok || result.statusCode !== 200) {
        throw new Error(result.statusMessage || '로그인에 실패했습니다.');
      }

      // 로그인 성공 후 사용자 정보를 다시 조회
      const userResponse = await fetch(API_ENDPOINTS.USER_INFO, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('사용자 정보 조회에 실패했습니다.');
      }

      const userResult = await userResponse.json();
      console.log('사용자 정보 응답:', userResult);

      if (!userResult.data) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 서버에서 반환한 사용자 정보 설정
      const userInfo = {
        id: userResult.data.id,
        email: userResult.data.email,
        name: userResult.data.name,
        phone: userResult.data.phone,
        companyName: userResult.data.companyName,
        companyRole: userResult.data.companyRole
      };
      
      setUser(userInfo);
      setIsAuthenticated(true);
      setIsAdmin(userInfo.companyRole === 'ADMIN');
      setIsLoading(false);
      
      // 로그인 성공 후 즉시 리다이렉트
      const targetPath = userInfo.companyRole === 'ADMIN' ? '/dashboard-admin' : '/dashboard';
      console.log('리다이렉트 대상:', targetPath);
      navigate(targetPath, { replace: true });
      
    } catch (error) {
      console.error('로그인 중 오류:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/login');
    }
  };

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]); // location.pathname이 변경될 때마다 실행

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    logout,
    checkAuthStatus
  };
}; 