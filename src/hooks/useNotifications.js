import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './useAuth';
import ToastNotification from '../components/common/ToastNotification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const { user } = useAuth();

  const removeToast = useCallback((id) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((notification) => {
    const toastId = Date.now();
    setToastNotifications(prev => [...prev, { ...notification, id: toastId }]);
    setTimeout(() => removeToast(toastId), 5000);
  }, [removeToast]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      setupSSE();
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const sse = new EventSource(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
      withCredentials: true
    });
    eventSourceRef.current = sse;

    sse.addEventListener('connect', (event) => {
      console.log('SSE 연결 성공:', event.data);
      setIsConnected(true);
    });

    sse.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        console.log('새로운 알림 수신:', notification);
        setNotifications(prev => [notification, ...prev]);
        addToast(notification);
      } catch (error) {
        console.error('알림 데이터 파싱 실패:', error);
      }
    });

    sse.onerror = (error) => {
      console.error('SSE 연결 에러:', error);
      setIsConnected(false);
      sse.close();
      eventSourceRef.current = null;
      // 5초 후 재연결 시도
      setTimeout(() => {
        if (user?.id) {
          setupSSE();
        }
      }, 5000);
    };
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
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  };

  const getFilteredNotifications = () => {
    return showReadNotifications
      ? notifications.filter(n => n.read)
      : notifications.filter(n => !n.read);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showReadNotifications,
        setShowReadNotifications,
        markAsRead,
        markAllAsRead,
        disconnectSSE,
        getFilteredNotifications,
        isConnected,
        toastNotifications,
        removeToast
      }}
    >
      {children}
      {toastNotifications.map(toast => (
        <ToastNotification
          key={toast.id}
          notification={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 