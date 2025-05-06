import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// 기본 axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// 토큰 갱신용 별도 인스턴스 생성
const refreshTokenInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    // 401 Unauthorized 처리 (access token 만료)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 Unauthorized 처리 (access token 만료)');
      if (isRefreshing) {
        // 이미 토큰 갱신 중이라면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // 토큰 갱신 요청은 별도 인스턴스 사용
      return new Promise((resolve, reject) => {
        refreshTokenInstance
          .post('/auth/refresh-token', {}, { withCredentials: true })
          .then(({ data }) => {
            const newAccessToken = data.accessToken;
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch(refreshErr => {
            processQueue(refreshErr, null);
            // 리프레시 실패 시 로그인 페이지로 리다이렉트
            window.location.replace('/login');
            reject(refreshErr);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;