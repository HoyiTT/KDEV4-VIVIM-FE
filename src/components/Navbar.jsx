import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
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
  gap: 32px;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
  cursor: pointer;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 16px;
`;

const MenuItem = styled.li`
  margin: 0;
  padding: 0;
`;

const MenuButton = styled.button`
  padding: 8px 16px;
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

  &:hover {
    background: #f8fafc;
    color: #2E7D32;
  }
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
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #2E7D32;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
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
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    color: #2E7D32;
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: '대시보드' },
    { path: '/project-list', label: '프로젝트 목록' },
    { path: '/admin-inquiry-list', label: '문의 관리' },
    { path: '/user-list', label: '사용자 관리' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(`/user-edit/${user.id}`);
  };

  return (
    <NavbarContainer>
      <LeftSection>
        <Logo onClick={() => navigate('/dashboard')}>
          비빔
        </Logo>
        <MenuList>
          {menuItems.map(item => (
            <MenuItem key={item.path}>
              <MenuButton
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </MenuButton>
            </MenuItem>
          ))}
        </MenuList>
      </LeftSection>
      <RightSection>
        <NotificationIcon onClick={() => setShowNotifications(!showNotifications)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <NotificationBadge />
        </NotificationIcon>
        <NotificationPanel show={showNotifications}>
          <div>알림이 없습니다.</div>
        </NotificationPanel>
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
  );
};

export default Navbar;