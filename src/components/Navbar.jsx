import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeMenuItem, handleMenuClick }) => {
  const navigate = useNavigate();

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const isAdmin = decodedToken?.role === 'ADMIN';

  const menuItems = [
    { name: '대시보드', path: '/dashboard', showFor: 'all' },
    { 
      name: '프로젝트 관리', 
      path: isAdmin ? '/admin-projects' : '/project-list',
      showFor: 'all' 
    },
    { name: '회사 관리', path: '/company-management', showFor: 'admin' },
    { name: '사용자 관리', path: '/user-management', showFor: 'admin' }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.showFor === 'all' || 
    (isAdmin && item.showFor === 'admin')
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <NavbarContainer>
      <NavContent>
        <NavList>
          {filteredMenuItems.map((item) => (
            <NavItem
              key={item.name}
              active={activeMenuItem === item.name}
              onClick={() => {
                handleMenuClick(item.name);
                navigate(item.path);
              }}
            >
              {item.name}
            </NavItem>
          ))}
        </NavList>
        <LogoutButtonContainer>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </LogoutButtonContainer>
      </NavContent>
    </NavbarContainer>
  );
};

// Update NavbarContainer and add NavContent
const NavbarContainer = styled.nav`
  display: flex;
  justify-content: center;
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

const NavContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  position: relative;
`;

const LogoutButtonContainer = styled.div`
  position: absolute;
  right: 0;
`;

const NavList = styled.div`
  display: flex;
  gap: 48px;
  align-items: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const NavItem = styled.div`
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

// Add styled component for logout button
const LogoutButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
`;

export default Navbar;