import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { API_ENDPOINTS } from '../config/api';
import { FaUser, FaHome, FaBell } from 'react-icons/fa';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const controllerRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // 초기 알림 목록 가져오기
  const fetchInitialNotifications = async (token) => {
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.LIST, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setNotifications(data || []);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
    }
  };

  const connectSSE = async (token) => {
    // 이미 연결된 경우 중복 연결 방지
    if (isConnected) {
      console.log('SSE connection already exists');
      return;
    }

    // 이전 연결이 있다면 종료
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    try {
      await fetchEventSource(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
        headers: {
          'Authorization': token
        },
        signal: ctrl.signal,
        onopen(response) {
          if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
            console.log('SSE connection opened successfully.');
            setIsConnected(true);
            return;
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            console.error('SSE connection failed:', response.status, response.statusText);
            ctrl.abort();
            throw new Error('Client error');
          } else {
            console.error('SSE connection failed:', response.status, response.statusText);
            ctrl.abort();
            throw new Error('Server error');
          }
        },
        onmessage(event) {
          // "connected" 메시지는 무시
          if (event.data === "connected") {
            console.log('SSE connected message received');
            return;
          }
          
          try {
            const newNotification = JSON.parse(event.data);
            setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        },
        onerror(err) {
          console.error('EventSource failed:', err);
          setIsConnected(false);
          // 에러 발생 시 재연결 시도하지 않음
          throw err;
        }
      });
    } catch (error) {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    }
  };

  const disconnectSSE = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsConnected(false);
  };

  // 컴포넌트 언마운트 시 SSE 연결 해제
  useEffect(() => {
    return () => {
      disconnectSSE();
    };
  }, []);

  const value = {
    notifications,
    setNotifications,
    isConnected,
    connectSSE,
    disconnectSSE,
    fetchInitialNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 