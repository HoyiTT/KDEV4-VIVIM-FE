import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      setupSSE();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
        withCredentials: true
      });
      setNotifications(data);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  const setupSSE = () => {
    if (eventSource) {
      eventSource.close();
    }

    const sse = new EventSource(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
      withCredentials: true
    });

    sse.addEventListener('connect', (event) => {
      console.log('SSE 연결 성공:', event.data);
      setIsConnected(true);
    });

    sse.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        console.log('새로운 알림 수신:', notification);
        setNotifications(prev => [notification, ...prev]);
      } catch (error) {
        console.error('알림 데이터 파싱 실패:', error);
      }
    });

    sse.onerror = (error) => {
      console.error('SSE 연결 에러:', error);
      setIsConnected(false);
      sse.close();
      
      // 5초 후 재연결 시도
      setTimeout(() => {
        if (user?.id) {
          setupSSE();
        }
      }, 5000);
    };

    setEventSource(sse);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId), {}, {
        withCredentials: true
      });
      await fetchNotifications();
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {}, {
        withCredentials: true
      });
      await fetchNotifications();
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      throw error;
    }
  };

  const disconnectSSE = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsConnected(false);
  };

  const getFilteredNotifications = () => {
    return showReadNotifications
      ? notifications.filter(n => n.read)
      : notifications.filter(n => !n.read);
  };

  return {
    notifications,
    showReadNotifications,
    setShowReadNotifications,
    markAsRead,
    markAllAsRead,
    disconnectSSE,
    getFilteredNotifications,
    isConnected
  };
}; 