import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';

const DashboardAdmin = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        {/* 관리자 대시보드 내용 */}
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.main`
  padding: 24px;
  margin-top: 60px;
`;

export default DashboardAdmin;
