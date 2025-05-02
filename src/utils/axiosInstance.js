import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getToken, setToken, removeToken, isTokenValid } from './tokenUtils';

let globalNavigate = null;

export const setNavigate = (navigate) => {
  globalNavigate = navigate;
};

// 토큰 만료 시간 확인 함수
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // JWT exp는 초 단위
    return Date.now() >= expirationTime;
  } catch (error) {
    return true; // 토큰 파싱에 실패하면 만료된 것으로 간주
  }
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // 쿠키 기반 인증을 위해 추가
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰이 필요한 경우에만 Authorization 헤더 추가
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log('응답 에러 발생:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
      isRetry: error.config._retry,
      message: error.message
    });

    const originalRequest = error.config;

    // 401 에러이고, 이미 재시도한 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 에러 감지, 토큰 갱신 시도');
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새로운 액세스 토큰 요청
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true  // 쿠키 기반 인증을 위해 추가
          }
        );

        console.log('토큰 갱신 성공:', response.data);
        
        // 실패한 요청 재시도
        console.log('원래 요청 재시도...');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 토큰 갱신 실패 시 로그아웃 처리
        if (globalNavigate) {
          globalNavigate('/login');
        }
        // 원래 에러를 그대로 전파
        return Promise.reject(error);
      }
    }

    // 다른 에러는 그대로 전파
    return Promise.reject(error);
  }
);

export default axiosInstance; 