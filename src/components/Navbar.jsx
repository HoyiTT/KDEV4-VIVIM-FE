import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeMenuItem, handleMenuClick }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

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
  const userId = decodedToken?.userId;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`https://dev.vivim.co.kr/api/users/${userId}`, {
          headers: {
            'Authorization': token
          }
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          setUserInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId, token]);

  const userName = decodedToken?.username || '사용자';  // Changed from name to username
  const companyName = decodedToken?.companyName || '';  // This should match the JWT field name

  console.log('Decoded token:', decodedToken); // For debugging

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
        <UserSection>
          {userInfo && (
            <UserInfo>
              <UserName onClick={() => navigate(`/user-edit/${userId}`)}>
                {userInfo.name}
              </UserName>
              <CompanyInfo>
                {userInfo.companyName} · {
                  userInfo.companyRole === 'CUSTOMER' ? '고객사' : 
                  userInfo.companyRole === 'DEVELOPER' ? '개발사' : 
                  userInfo.companyRole === 'ADMIN' ? '관리자' : ''
                }
              </CompanyInfo>
            </UserInfo>
          )}
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
        </UserSection>
      </NavContent>
    </NavbarContainer>
  );
};

// Update or add these styled components
const CompanyInfo = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: right;
`;

// Update NavbarContainer and add NavContent
const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 1000;
`;
const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 0;
  position: relative;  // 추가
`;

const NavList = styled.div`
  display: flex;
  gap: 48px;
  align-items: center;
  position: absolute;  // 추가
  left: 50%;  // 추가
  transform: translateX(-50%);  // 추가
`;

const LogoutButtonContainer = styled.div`
  display: flex;
  margin-left: auto;
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

// Add or update these styled components
const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #2E7D32;
  }
`;

const CompanyName = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e2e8f0;
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
  // margin-left: auto; 제거
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