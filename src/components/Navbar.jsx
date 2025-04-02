import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Changed this line

const Navbar = ({ activeMenuItem, handleMenuClick }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
      } catch (error) {
        console.error('Token decode error:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo(null);
    navigate('/login');
  };

  return (
    <NavbarContainer>
      <Logo onClick={() => navigate('/')}>VIVIM</Logo>
      <MenuItems>
        <MenuItem 
          active={activeMenuItem === '대시보드'} 
          onClick={() => {
            handleMenuClick('대시보드');
            navigate('/dashboard');
          }}
        >
          대시보드
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '프로젝트 관리 - 관리자'} 
          onClick={() => {
            handleMenuClick('프로젝트 관리 - 관리자');
            navigate('/admin-projects');
          }}
        >
          프로젝트 관리 - 관리자
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '프로젝트 관리 - 유저'} 
          onClick={() => {
            handleMenuClick('프로젝트 관리 - 유저');
            navigate('/user-projects');
          }}
        >
          프로젝트 관리 - 유저
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '회사 관리'} 
          onClick={() => {
            handleMenuClick('회사 관리');
            navigate('/company-management');
          }}
        >
          회사 관리
        </MenuItem>
        <MenuItem 
          active={activeMenuItem === '사용자 관리'} 
          onClick={() => {
            handleMenuClick('사용자 관리');
            navigate('/user-management'); // 경로를 유저 관리 페이지로 변경
          }}
        >
          사용자 관리
        </MenuItem>
      </MenuItems>
      <UserSection>
        {userInfo ? (
          <>
            <UserAvatar />
            <UserInfo>
              <UserName>{userInfo.name}</UserName>
              <UserEmail>{userInfo.email}</UserEmail>
            </UserInfo>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </>
        ) : (
          <LoginButton onClick={() => navigate('/login')}>로그인</LoginButton>
        )}
      </UserSection>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #2E7D32;
  cursor: pointer;
`;

const MenuItems = styled.div`
  display: flex;
  gap: 24px;
`;

const MenuItem = styled.div`
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#2E7D32' : '#64748b'};
  cursor: pointer;
  padding: 8px 0;
  border-bottom: ${props => props.active ? '2px solid #2E7D32' : 'none'};
  
  &:hover {
    color: #2E7D32;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e2e8f0;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const LoginButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #1B5E20;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
`;

export default Navbar;