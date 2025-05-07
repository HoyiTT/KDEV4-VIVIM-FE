import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: '대시보드', icon: '📊' },
    { path: '/projects', label: '프로젝트', icon: '📁' },
    { path: '/inquiries', label: '문의사항', icon: '💬' },
    { path: '/posts', label: '게시판', icon: '📝' },
    { path: '/approvals', label: '승인관리', icon: '✅' },
  ];

  const adminMenuItems = [
    { path: '/dashboard-admin', label: '관리자 대시보드', icon: '👑' },
    { path: '/admin/projects', label: '프로젝트 관리', icon: '📁' },
    { path: '/admin/users', label: '사용자 관리', icon: '👥' },
    { path: '/admin/inquiries', label: '문의사항 관리', icon: '💬' },
    { path: '/admin/settings', label: '시스템 설정', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarContainer>
      <LogoSection>
        <Logo onClick={() => navigate('/')}>비빔</Logo>
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
  width: 240px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const LogoSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
  cursor: pointer;
`;

const ProfileSection = styled.div`
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ProfileImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2E7D32;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
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
  padding: 24px;
  flex: 1;
  overflow-y: auto;
`;

const MenuItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.active ? '#2E7D32' : '#1e293b'};
  background: ${props => props.active ? '#e8f5e9' : 'transparent'};
  font-weight: ${props => props.active ? '500' : '400'};
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#e8f5e9' : '#f8fafc'};
  }

  & + & {
    margin-top: 4px;
  }
`;

const LogoutSection = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

export default Sidebar; 