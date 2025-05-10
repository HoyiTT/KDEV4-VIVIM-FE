import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from './Sidebar';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  height: 80px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
    display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 1000;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
  cursor: pointer;
  white-space: nowrap;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #2E7D32;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  white-space: nowrap;
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  svg {
    width: 24px;
    height: 24px;
    color: #64748b;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-top: 8px;
  padding: 16px;
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1000;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
`;

const NotificationTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const NotificationFilters = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;
  padding: 0 16px;
`;

const FilterButton = styled.button`
  padding: 4px 12px;
  border: 1px solid ${props => props.active ? '#2E7D32' : '#e2e8f0'};
  border-radius: 6px;
  background: ${props => props.active ? '#2E7D32' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#2E7D32' : '#f8fafc'};
  }
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.unread ? '#f8fafc' : 'white'};
  transition: background-color 0.2s;
  animation: ${props => props.isNew ? 'fadeIn 0.5s ease-in-out' : 'none'};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    background-color: #f1f5f9;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
`;

const NotificationTypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  color: ${props => props.unread ? '#1e293b' : '#64748b'};
  font-size: 0.875rem;
  font-weight: ${props => props.unread ? '600' : '500'};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const NotificationText = styled.div`
  font-size: 0.875rem;
  color: ${props => props.unread ? '#334155' : '#64748b'};
  line-height: 1.4;
  margin-top: 4px;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
`;

const NotificationEmpty = styled.div`
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;

const NotificationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
    color: #2E7D32;
  }
`;

const MarkAllReadButton = styled.button`
  padding: 4px 12px;
  border: 1px solid #2E7D32;
  border-radius: 6px;
  background: white;
  color: #2E7D32;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8f5e9;
  }
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;

const NewNotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  margin: 8px;
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #64748b;
  transition: all 0.2s;

  @media (max-width: 850px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    color: #2E7D32;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const MobileMenuPanel = styled.div`
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 999;

  @media (max-width: 850px) {
    display: ${props => props.show ? 'block' : 'none'};
  }
`;

const MobileMenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileMenuItem = styled.li`
  margin: 0;
  padding: 0;
`;

const MobileMenuButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${props => props.active ? '#2E7D32' : '#64748b'};
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  text-align: left;

  &:hover {
    background: #f8fafc;
    color: #2E7D32;
  }
`;

const MobileMenuContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 240px;
  height: 100%;
  background: white;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationPanelRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    getFilteredNotifications,
    showReadNotifications,
    setShowReadNotifications,
    isConnected
  } = useNotifications();
  const [newNotifications, setNewNotifications] = useState(new Set());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setShowNotifications(false);
        setNewNotifications(new Set());
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.read) {
        setNewNotifications(prev => new Set([...prev, latestNotification.id]));
        
        // 새로운 알림이 오면 알림 패널이 닫혀있을 때만 알림 표시
        if (!showNotifications) {
          // 브라우저 알림 권한 요청
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
          
          // 브라우저 알림 표시
          if (Notification.permission === 'granted') {
            new Notification('새로운 알림', {
              body: latestNotification.content,
              icon: '/favicon.ico'
            });
          }
        }
      }
    }
  }, [notifications, showNotifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setShowNotifications(false);

    // 알림 타입에 따른 페이지 이동
    const type = notification.type;
    const typeId = notification.typeId;

    // DELETED 타입은 무시
    if (type.endsWith('_DELETED')) {
      return;
    }

    // 타입에 따른 페이지 이동
    if (type.startsWith('PROJECT_')) {
      navigate(`/project/${typeId}`);
    } else if (type.startsWith('PROPOSAL_')) {
      navigate(`/approval/${typeId}`);
    } else if (type.startsWith('DECISION_')) {
      navigate(`/approval/${typeId}`);
    }
  };

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    markAsRead(notificationId);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(`/user-edit/${user.id}`);
  };

  const filteredNotifications = getFilteredNotifications();

  // 알림 타입에 따른 아이콘과 텍스트 반환
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case 'PROJECT_CREATED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          ),
          label: '프로젝트'
        };
      case 'PROPOSAL_CREATED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          ),
          label: '승인요청'
        };
      case 'DECISION_CREATED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          label: '승인응답'
        };
      default:
        return {
          icon: null,
          label: '알림'
        };
    }
  };

  return (
    <>
      <NavbarContainer>
        <LeftSection>
          <Logo onClick={() => navigate('/dashboard')}>
            비빔
          </Logo>
        </LeftSection>
        <RightSection>
          <NotificationIcon onClick={() => setShowNotifications(!showNotifications)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && <NotificationBadge />}
          </NotificationIcon>
          <UserProfile onClick={handleProfileClick}>
            <Avatar>{user?.name?.[0]}</Avatar>
            <UserInfo>
              <UserName>{user?.name}</UserName>
              <UserRole>{user?.position || (user?.companyRole === 'ADMIN' ? '관리자' : '사용자')}</UserRole>
            </UserInfo>
          </UserProfile>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </RightSection>
      </NavbarContainer>
      <Sidebar />
      {showNotifications && (
        <NotificationPanel ref={notificationPanelRef}>
          <NotificationHeader>
            <NotificationTitle>알림</NotificationTitle>
            {unreadCount > 0 && (
              <MarkAllReadButton onClick={markAllAsRead}>
                모두 읽음
              </MarkAllReadButton>
            )}
          </NotificationHeader>
          <NotificationFilters>
            <FilterButton
              active={!showReadNotifications}
              onClick={() => setShowReadNotifications(false)}
            >
              안읽은 알림 ({notifications.filter(n => !n.read).length})
            </FilterButton>
            <FilterButton
              active={showReadNotifications}
              onClick={() => setShowReadNotifications(true)}
            >
              읽은 알림 ({notifications.filter(n => n.read).length})
            </FilterButton>
          </NotificationFilters>
          <NotificationList>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  unread={!notification.read}
                  isNew={newNotifications.has(notification.id)}
                >
                  {newNotifications.has(notification.id) && <NewNotificationBadge />}
                  <NotificationContent onClick={() => handleNotificationClick(notification)}>
                    <NotificationTypeIcon unread={!notification.read}>
                      {(() => {
                        const { icon, label } = getNotificationTypeInfo(notification.type);
                        return (
                          <>
                            {icon}
                            {label}
                          </>
                        );
                      })()}
                    </NotificationTypeIcon>
                    <NotificationText unread={!notification.read}>
                      {notification.content}
                    </NotificationText>
                    <NotificationTime>
                      {new Date(notification.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </NotificationTime>
                  </NotificationContent>
                  {!notification.read && (
                    <NotificationActions>
                      <ActionButton onClick={(e) => handleMarkAsRead(e, notification.id)}>
                        읽음
                      </ActionButton>
                    </NotificationActions>
                  )}
                </NotificationItem>
              ))
            ) : (
              <NotificationEmpty>
                {showReadNotifications ? '읽은 알림이 없습니다' : '안읽은 알림이 없습니다'}
              </NotificationEmpty>
            )}
          </NotificationList>
        </NotificationPanel>
      )}
    </>
  );
};

export default Navbar;