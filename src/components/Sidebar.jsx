import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeMenuItem, handleMenuClick }) => {
  const navigate = useNavigate();

  const handleUserManagement = () => {
    handleMenuClick('유저 관리');
    navigate('/user-management');
  };

  const handleDashboard = () => {
    handleMenuClick('대시보드');
    navigate('/dashboard');
  };

  const handleCompanyManagement = () => {
    handleMenuClick('회사 관리');
    navigate('/company-management');
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo src="/logo.svg" alt="Logo" />
        <Title>BN 시스템 프로젝트 관리</Title>
      </SidebarHeader>
      
      <MenuList>
        <MenuItem 
          active={activeMenuItem === '대시보드'} 
          onClick={handleDashboard}
        >
          대시보드
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '진행중인 프로젝트'} 
          onClick={() => handleMenuClick('진행중인 프로젝트')}
        >
          진행중인 프로젝트
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '완료된 프로젝트'} 
          onClick={() => handleMenuClick('완료된 프로젝트')}
        >
          완료된 프로젝트
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '회사 관리'} 
          onClick={handleCompanyManagement}
        >
          회사 관리
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '유저 관리'} 
          onClick={handleUserManagement}
        >
          유저 관리
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '통계 및 보고서'} 
          onClick={() => handleMenuClick('통계 및 보고서')}
        >
          통계 및 보고서
        </MenuItem>
      </MenuList>
    </SidebarContainer>
  );
};

// Styled Components
const SidebarContainer = styled.div`
  width: 280px;
  background: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 0 24px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #2E7D32;
  margin: 0;
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
`;

const MenuItem = styled.div`
  padding: 12px;
  margin: 4px 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.active ? '#2E7D32' : '#64748b'};
  background: ${props => props.active ? 'rgba(46, 125, 50, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(46, 125, 50, 0.1)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

export default Sidebar;