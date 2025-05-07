import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // ... existing code ...

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <PageTitle>프로젝트 목록</PageTitle>
          <AddButton onClick={() => navigate('/project-create')}>
            새 프로젝트 등록
          </AddButton>
        </Header>

        {/* ... rest of the component ... */}
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  margin-left: 240px;
`;

// ... rest of the styled components ... 