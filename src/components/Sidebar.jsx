import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');

  const menuItems = [
    { path: '/dashboard', label: '대시보드', icon: '📊' },
    { path: '/projects', label: '프로젝트', icon: '📁' },
    { path: '/inquiries', label: '문의사항', icon: '💬' },
    { path: '/posts', label: '게시판', icon: '📝' },
    { path: '/approvals', label: '승인관리', icon: '✅' },
  ];

  const adminMenuItems = [
    { path: '/dashboard-admin', label: '관리자 대시보드', icon: '👑' },
    { path: '/admin/projects', label: '프로젝트 관리', icon: '' },
    { path: '/company-management', label: '회사 관리', icon: '🏢' },
    { path: '/user-management', label: '사용자 관리', icon: '👥' },
    { path: '/admin/inquiries', label: '문의사항 관리', icon: '💬' },
    { path: '/audit-log', label: '로그 기록', icon: '📜' },
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

  return (
    <SidebarContainer>
      <LogoSection onClick={handleLogoClick}>
        <Logo>비빔</Logo>
        <NotificationButton onClick={() => navigate('/notifications')}>
          알림
          <NotificationBadge>3</NotificationBadge>
        </NotificationButton>
      </LogoSection>

      <ProfileSection>
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
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </MenuItem>
          ))
        ) : (
          menuItems.map((item) => (
            <MenuItem
              key={item.path}
              active={location.pathname === item.path}
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
  cursor: pointer;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
`;

const NotificationButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #f1f5f9;
  }
`;

const NotificationBadge = styled.span`
  background: #ef4444;
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
  color: ${props => props.active ? '#2E7D32' : '#1e293b'};
  background: ${props => props.active ? '#e8f5e9' : 'transparent'};
  font-weight: ${props => props.active ? '500' : '400'};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#e8f5e9' : '#f8fafc'};
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

export default Sidebar; 