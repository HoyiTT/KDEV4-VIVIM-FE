import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeMenuItem, handleMenuClick }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: '대시보드', path: '/dashboard-admin' },
    { 
      name: '프로젝트 관리', 
      path: isAdmin ? '/admin-projects' : '/project-list',
      showFor: 'all' 
    },
    { name: '회사 관리', path: '/company-management', showFor: 'admin' },
    { name: '사용자 관리', path: '/user-management', showFor: 'admin' },
    { name: '관리자 문의', path: '/admin-inquiry', showFor: 'admin' },
    { name: '감사 로그', path: '/audit-log', showFor: 'admin' }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.showFor === 'all' || 
    (isAdmin && item.showFor === 'admin')
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleClick = (menuItem) => {
    if (handleMenuClick) {
      handleMenuClick(menuItem.name);
    }
    navigate(menuItem.path);
  };

  return (
    <NavbarContainer>
      <NavContent>
        <LeftSection>
          <LogoContainer onClick={() => navigate(isAdmin ? '/dashboard-admin' : '/dashboard')}>
            <LogoImage src="/logo_only.png" alt="Vivim Logo" />
          </LogoContainer>
          <NavList isMobile={isMobileMenuOpen}>
            {filteredMenuItems.map((item) => (
              <NavItem
                key={item.name}
                active={activeMenuItem === item.name}
                onClick={() => handleClick(item)}
              >
                {item.name}
              </NavItem>
            ))}
          </NavList>
        </LeftSection>
        <UserSection>
          <NotificationIcon onClick={() => setShowNotifications(!showNotifications)}>
            <BellImage src="/bell.png" alt="notifications" />
          </NotificationIcon>
          {showNotifications && (
            <NotificationPanel>
              <NotificationHeader>알림</NotificationHeader>
              <NotificationEmpty>최근 알림이 없습니다</NotificationEmpty>
            </NotificationPanel>
          )}
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

// Update NavbarContainer


// Add HamburgerMenu component
const HamburgerMenu = styled.div`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 20px;
  cursor: pointer;
  z-index: 1001;

  span {
    width: 100%;
    height: 2px;
    background: #2E7D32;
    transition: all 0.3s;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

// Update NavList for mobile
const NavList = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;
  height: 100%;

  @media (max-width: 768px) {
    position: fixed;
    top: 64px;
    left: ${props => props.isMobile ? '0' : '-100%'};
    transform: none;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 64px);
    background: white;
    padding: 20px;
    gap: 20px;
    transition: left 0.3s ease-in-out;
    z-index: 1000;
  }
`;

// Update UserSection
const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
  padding-right: 24px;
`;

// Update NavItem
const NavItem = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.active ? '#000' : '#666'};
  cursor: pointer;
  padding: 8px 0;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #000;
    opacity: ${props => props.active ? '1' : '0'};
    transition: opacity 0.2s ease;
  }

  &:hover {
    color: #000;
  }
`;

const NotificationIcon = styled.div`
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  z-index: 1000;
`;

const NotificationHeader = styled.div`
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
`;

const NotificationEmpty = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

// Update or add these styled components
const CompanyInfo = styled.div`
  font-size: 13px;
  color: #666;
`;

// Update NavbarContainer and add NavContent
const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
`;

const NavContent = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const LogoContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
`;

const LogoImage = styled.img`
  height: 24px;
  object-fit: contain;
`;

const LogoutButtonContainer = styled.div`
  display: flex;
  margin-left: auto;
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

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #000;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
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
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
`;

export default Navbar;

// Add these new styled components
const BellImage = styled.img`
  width: 20px;
  height: 20px;
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;