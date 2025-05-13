import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { FaHome, FaProjectDiagram, FaBell } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isClient, isDeveloperManager } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationPanelRef = useRef(null);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    getFilteredNotifications,
    showReadNotifications,
    setShowReadNotifications
  } = useNotifications();

  // 읽지 않은 알림 수 계산
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const menuItems = [
    { path: '/dashboard', label: '대시보드', icon: '' },
    { path: '/user/projects', label: '프로젝트 관리' },
    { path: '/user/inquiries', label: '관리자에게 문의하기'},
  ];

  const adminMenuItems = [
    { path: '/dashboard-admin', label: '관리자 대시보드'},
    { path: '/admin/projects', label: '프로젝트 관리'},
    { path: '/company-management', label: '회사 관리' },
    { path: '/user-management', label: '사용자 관리'},
    { path: '/admin/inquiries', label: '문의사항 관리' },
    { path: '/audit-log', label: '로그 기록'},
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (user?.companyRole === 'ADMIN') {
      navigate('/dashboard-admin');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setShowNotifications(false);

    // 알림 타입에 따른 페이지 이동
    const type = notification.type;
    const typeId = notification.typeId;

    if (type.endsWith('_DELETED')) {
      return;
    }

    if (type.startsWith('PROJECT_')) {
      navigate(`/project/${typeId}`);
    } else if (type.startsWith('PROPOSAL_')) {
      navigate(`/approval/${typeId}`);
    } else if (type.startsWith('DECISION_')) {
      navigate(`/approval/${typeId}`);
    } else if (type.startsWith('POST_')) {
      navigate(`/post/${typeId}`);
    } else if (type.startsWith('INQUIRY_')) {
      navigate(`/inquiry/${typeId}`);
    }
  };

  const handleNotificationToggle = (e) => {
    e.stopPropagation();
    setShowNotifications(prev => !prev);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const filteredNotifications = getFilteredNotifications();

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
          label: '프로젝트 생성'
        };
      case 'PROJECT_MODIFIED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
              <path d="M15 12l2 2 4-4"></path>
            </svg>
          ),
          label: '프로젝트 수정'
        };
      case 'PROJECT_DELETED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
              <line x1="15" y1="12" x2="9" y2="18"></line>
              <line x1="9" y1="12" x2="15" y2="18"></line>
            </svg>
          ),
          label: '프로젝트 삭제'
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
          label: '승인요청 생성'
        };
      case 'PROPOSAL_MODIFIED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
              <path d="M15 12l2 2 4-4"></path>
            </svg>
          ),
          label: '승인요청 수정'
        };
      case 'PROPOSAL_DELETED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
              <line x1="15" y1="12" x2="9" y2="18"></line>
              <line x1="9" y1="12" x2="15" y2="18"></line>
            </svg>
          ),
          label: '승인요청 삭제'
        };
      case 'DECISION_CREATED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          label: '승인응답 생성'
        };
      case 'DECISION_MODIFIED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
              <path d="M15 12l2 2 4-4"></path>
            </svg>
          ),
          label: '승인응답 수정'
        };
      case 'DECISION_DELETED':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
              <line x1="15" y1="12" x2="9" y2="18"></line>
              <line x1="9" y1="12" x2="15" y2="18"></line>
            </svg>
          ),
          label: '승인응답 삭제'
        };
      default:
        return {
          icon: null,
          label: '알림'
        };
    }
  };

  return (
    <SidebarContainer>
      <LogoSection>
        <Logo onClick={handleLogoClick}>비빔</Logo>
        <NotificationButton 
          onClick={(e) => {
            e.stopPropagation();
            setShowNotifications(prev => !prev);
          }}
          $active={showNotifications.toString()}
        >
          알림
          {unreadCount > 0 && (
            <NotificationCount data-active={showNotifications.toString()}>
              {unreadCount}
            </NotificationCount>
          )}
        </NotificationButton>
      </LogoSection>

      <ProfileSection onClick={() => navigate(`/user-edit/${user?.id}`)} style={{ cursor: 'pointer' }}>
        <ProfileImage>
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </ProfileImage>
        <ProfileInfo>
          <UserName>{user?.name || '사용자'}</UserName>
          {user?.companyRole && (
            <UserRole>{user.companyRole === 'ADMIN' ? '관리자' : '일반 사용자'}</UserRole>
          )}
          <UserCompany>{user?.companyName || '회사 정보 없음'}</UserCompany>
          <UserEmail>{user?.email || '이메일 정보 없음'}</UserEmail>
          <UserPhone>{user?.phone || '전화번호 없음'}</UserPhone>
        </ProfileInfo>
      </ProfileSection>

      <MenuSection>
        {user?.companyRole === 'ADMIN' ? (
          adminMenuItems.map((item) => (
            <MenuItem
              key={item.path}
              $active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </MenuItem>
          ))
        ) : (
          menuItems.map((item) => (
            <MenuItem
              key={item.path}
              $active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </MenuItem>
          ))
        )}
      </MenuSection>

      <LogoutSection>
        <LogoutButton onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </LogoutSection>

      {showNotifications && (
        <NotificationPanel ref={notificationPanelRef}>
          <NotificationHeader>
            <NotificationTitle>알림</NotificationTitle>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <MarkAllReadButton onClick={markAllAsRead}>
                  모두 읽음
                </MarkAllReadButton>
              )}
              <CloseButton onClick={handleCloseNotifications}>
                ✕
              </CloseButton>
            </div>
          </NotificationHeader>
          <NotificationFilters>
            <FilterButton
              active={!showReadNotifications.toString()}
              onClick={() => setShowReadNotifications(false)}
            >
              안읽은 알림 ({notifications.filter(n => !n.read).length})
            </FilterButton>
            <FilterButton
              active={showReadNotifications.toString()}
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
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationContent>
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
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const LogoSection = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
  cursor: pointer;
`;

const NotificationButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active === 'true' ? '#e8f5e9' : '#f8fafc'};
  color: ${props => props.$active === 'true' ? '#2E7D32' : '#1e293b'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$active === 'true' ? '#e8f5e9' : '#f1f5f9'};
  }
`;

const NotificationCount = styled.span`
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
`;

const ProfileSection = styled.div`
  padding: 24px 32px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ProfileImage = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2E7D32;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const UserRole = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const UserCompany = styled.div`
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  margin-top: 2px;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 2px;
`;

const UserPhone = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 2px;
`;

const MenuSection = styled.div`
  padding: 24px 32px;
  flex: 1;
  overflow-y: auto;
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.$active ? '#2E7D32' : '#1e293b'};
  background: ${props => props.$active ? '#e8f5e9' : 'transparent'};
  font-weight: ${props => props.$active ? '500' : '400'};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#e8f5e9' : '#f8fafc'};
  }

  & + & {
    margin-top: 4px;
  }
`;

const LogoutSection = styled.div`
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &::before {
    content: '↪';
    font-size: 14px;
    font-weight: 400;
    transition: transform 0.2s ease;
  }

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &::before {
      transform: translateX(4px);
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

const NotificationPanel = styled.div`
  position: fixed;
  top: 0;
  left: 300px;
  width: 320px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e2e8f0;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 999;
  display: flex;
  flex-direction: column;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
`;

const NotificationTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const MarkAllReadButton = styled.button`
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

const NotificationFilters = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0;
  padding: 0 16px;
`;

const FilterButton = styled.button`
  padding: 4px 12px;
  border: 1px solid ${props => props.active === 'true' ? '#2E7D32' : '#e2e8f0'};
  border-radius: 6px;
  background: ${props => props.active === 'true' ? '#2E7D32' : 'white'};
  color: ${props => props.active === 'true' ? 'white' : '#64748b'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active === 'true' ? '#2E7D32' : '#f8fafc'};
  }
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.unread ? '#f8fafc' : 'white'};
  transition: background-color 0.2s;

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

const CloseButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

export default Sidebar; 