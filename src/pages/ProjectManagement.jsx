import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 20px;
`;

return (
  <PageContainer>
    <MainContent>
      <Card>
        <Header>
          <PageTitle>프로젝트 관리</PageTitle>
          <AddButton onClick={() => navigate('/project-create')}>
            새 프로젝트 등록
          </AddButton>
        </Header>
      </Card>
    </MainContent>
  </PageContainer>
); 