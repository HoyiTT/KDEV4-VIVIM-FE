import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import styled from 'styled-components';

const NotificationContext = createContext();

const NotificationPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  padding: 24px;
  overflow-y: auto;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const NotificationTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  line-height: 1;
  
  &:hover {
    color: #1e293b;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success':
        return '#2E7D32';
      case 'error':
        return '#D32F2F';
      case 'warning':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  }};
`;

const NotificationContent = styled.div`
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 8px;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #64748b;
`;

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications는 NotificationProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showReadNotifications, setShowReadNotifications] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const isInitializedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const controllerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // 알림 패널 토글
  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // SSE 연결 함수
  const connectSSE = useCallback(async () => {
    if (isConnectingRef.current || isConnected) {
      console.log('SSE 이미 연결 중이거나 연결됨');
      return;
    }

    try {
      isConnectingRef.current = true;
      console.log('SSE 연결 시도...');

      if (controllerRef.current) {
        console.log('이전 SSE 연결 종료');
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      await fetchEventSource(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
        signal: controller.signal,
        method: 'GET',
        keepalive: true,
        openWhenHidden: true,
        credentials: 'include',
        onopen(response) {
          console.log('SSE onopen 호출:', {
            status: response.status,
            contentType: response.headers.get('content-type')
          });

          if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
            console.log('SSE 연결 성공!');
            setIsConnected(true);
            isConnectingRef.current = false;
            isInitializedRef.current = true;
            return;
          }
          console.error('SSE 연결 실패');
          throw new Error('SSE 연결 실패');
        },
        onmessage(event) {
          console.log('SSE 메시지 수신:', event.data);

          if (event.data === "connected") {
            console.log('SSE 연결 확인 메시지 수신');
            return;
          }

          try {
            const notification = JSON.parse(event.data);
            console.log('알림 데이터 파싱 성공:', notification);
            setNotifications(prev => [notification, ...prev]);
          } catch (error) {
            console.error('알림 데이터 처리 실패:', error);
          }
        },
        onerror(error) {
          console.error('SSE 에러:', error);
          setIsConnected(false);
          isConnectingRef.current = false;
          controller.abort();
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isInitializedRef.current) {
              console.log('SSE 재연결 시도...');
              connectSSE();
            }
          }, 5000);
        },
        onclose() {
          console.log('SSE 연결 종료');
          setIsConnected(false);
          isConnectingRef.current = false;
        }
      });
    } catch (error) {
      console.error('SSE 연결 에러:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, [isConnected]);

  // 알림 목록 가져오기
  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
      setNotifications(data);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
    }
  };

  // 초기화
  useEffect(() => {
    // 초기 알림 목록 가져오기
    fetchNotifications();

    const initialize = async () => {
      if (!isInitializedRef.current && !isConnectingRef.current) {
        // SSE 연결
        await connectSSE();
      }
    };

    initialize();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
      isInitializedRef.current = false;
      isConnectingRef.current = false;
    };
  }, []);

  // 알림 읽음 상태 변경
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${notificationId}/read`, {
        isRead: true
      });
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('알림 읽음 상태 변경 실패:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.READ);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 상태에 따른 필터링
  const getFilteredNotifications = () => {
    return notifications.filter(notification => showReadNotifications || !notification.read);
  };

  // SSE 연결 해제 함수
  const disconnectSSE = useCallback(() => {
    console.log('SSE 연결 해제 시도');
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
    isInitializedRef.current = false;
    isConnectingRef.current = false;
  }, []);

  const value = {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
    showReadNotifications,
    setShowReadNotifications,
    disconnectSSE,
    isOpen,
    togglePanel
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPanel isOpen={isOpen}>
        <NotificationHeader>
          <NotificationTitle>알림</NotificationTitle>
          <CloseButton onClick={togglePanel}>&times;</CloseButton>
        </NotificationHeader>
        <NotificationList>
          {getFilteredNotifications().map(notification => (
            <NotificationItem key={notification.id} type={notification.type}>
              <NotificationContent>{notification.content}</NotificationContent>
              <NotificationTime>{new Date(notification.createdAt).toLocaleTimeString('ko-KR')}</NotificationTime>
            </NotificationItem>
          ))}
        </NotificationList>
      </NotificationPanel>
    </NotificationContext.Provider>
  );
}; 