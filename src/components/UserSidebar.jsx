import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaProjectDiagram, FaClipboardList, FaQuestionCircle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: '대시보드' },
    { path: '/user/projects', icon: <FaProjectDiagram />, label: '프로젝트 관리' },
    { path: '/inquiries', icon: <FaQuestionCircle />, label: '문의하기' },
    { path: '/board', icon: <FaClipboardList />, label: '게시판' }
  ];

  return (
    <SidebarContainer>
      <LogoSection>
        <Logo>VIVIM</Logo>
      </LogoSection>
      <MenuSection>
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => navigate(item.path)}
            $isActive={location.pathname === item.path}
          >
            <MenuIcon>{item.icon}</MenuIcon>
            <MenuLabel>{item.label}</MenuLabel>
          </MenuItem>
        ))}
      </MenuSection>
      <UserSection>
        <UserInfo>
          <UserName>{user?.name || '사용자'}</UserName>
          <UserRole>{user?.role || '일반 사용자'}</UserRole>
        </UserInfo>
      </UserSection>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 270px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
`;

const LogoSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
`;

const MenuSection = styled.div`
  flex: 1;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$isActive ? '#2E7D32' : '#64748b'};
  background-color: ${props => props.$isActive ? '#f0fdf4' : 'transparent'};
  border-right: ${props => props.$isActive ? '3px solid #2E7D32' : 'none'};

  &:hover {
    background-color: #f8fafc;
    color: #2E7D32;
  }
`;

const MenuIcon = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const MenuLabel = styled.span`
  font-size: 15px;
  font-weight: 500;
`;

const UserSection = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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

export default UserSidebar; 