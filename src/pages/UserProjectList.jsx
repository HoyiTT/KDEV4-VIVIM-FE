import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { NotificationProvider } from '../contexts/NotificationContext';

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    if (props.status === 'DELETED') {
      return 'rgba(185, 28, 28, 0.1)';
    }
    switch (props.status) {
      case 'PENDING':
        return 'rgba(220, 38, 38, 0.1)';
      case 'IN_PROGRESS':
        return 'rgba(46, 125, 50, 0.1)';
      case 'COMPLETED':
        return 'rgba(100, 116, 139, 0.1)';
      case 'ON_HOLD':
        return 'rgba(245, 158, 11, 0.1)';
      default:
        return 'rgba(100, 116, 139, 0.1)';
    }
  }};
  color: ${props => {
    if (props.status === 'DELETED') {
      return '#B91C1C';
    }
    switch (props.status) {
      case 'PENDING':
        return '#DC2626';
      case 'IN_PROGRESS':
        return '#2E7D32';
      case 'COMPLETED':
        return '#64748B';
      case 'ON_HOLD':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  }};

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    margin-right: 6px;
    background: currentColor;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
`;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  gap: 24px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  letter-spacing: -0.01em;

  &::before {
    content: '';
    display: block;
    width: 3px;
    height: 20px;
    background: #2E7D32;
    border-radius: 1.5px;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const ProjectsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
`;

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
  
  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1e293b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f8fafc;
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const PaginationNumber = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? '#2E7D32' : 'white'};
  border: 1px solid ${props => props.active ? '#2E7D32' : '#e2e8f0'};
  border-radius: 6px;
  color: ${props => props.active ? 'white' : '#1e293b'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#2E7D32' : '#f8fafc'};
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
`;

const UserProjectList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  console.log('UserProjectList rendered', { user, loading, error, projects });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    console.log('UserProjectList mounted, user:', user);
      fetchProjects();
  }, [user, isAuthenticated, authLoading]);

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      setLoading(true);
      
      let endpoint;
      if (user.companyRole === 'ADMIN') {
        endpoint = API_ENDPOINTS.ADMIN_PROJECTS;
      } else {
        endpoint = API_ENDPOINTS.USER_PROJECTS(user.id);
      }
      
      const response = await axiosInstance.get(endpoint);
      console.log('Projects fetched:', response.data);
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
      if (err.response?.status === 403) {
        setError('접근 권한이 없습니다.');
      } else {
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1);
  };

  const getProjectStatus = (project) => {
    if (project.deleted) {
      return '삭제됨';
    }
    switch (project.projectStatus) {
      case 'PROGRESS':
        return '진행중';
      case 'INSPECTION':
        return '검수중';
      case 'COMPLETED':
        return '완료';
      default:
        return '대기중';
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleApprovalRequest = (e, projectId) => {
    e.stopPropagation();
    navigate(`/project/${projectId}/approval/create`);
  };

  const handleApprovalResponse = (e, projectId) => {
    e.stopPropagation();
    navigate(`/project/${projectId}/approvals`);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색어로 필터링된 프로젝트 목록
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 현재 페이지의 프로젝트만 표시
  const getCurrentPageProjects = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  if (loading) {
    return (
      <PageContainer>
        <UserSidebar />
        <ContentArea>
          <LoadingMessage>프로젝트 목록을 불러오는 중...</LoadingMessage>
        </ContentArea>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <UserSidebar />
        <ContentArea>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={fetchProjects}>다시 시도</RetryButton>
        </ContentArea>
      </PageContainer>
    );
  }

  return (
    <NotificationProvider>
    <PageContainer>
      <UserSidebar />
        <ContentArea>
        <Header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              <PageTitle>내 프로젝트</PageTitle>
              <SearchSection>
                <SearchInput
                  type="text"
                  placeholder="프로젝트명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <SearchButton onClick={handleSearch}>
                  검색
                </SearchButton>
              </SearchSection>
            </div>
        </Header>

          {loading ? (
            <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
          ) : error ? (
            <LoadingMessage>{error}</LoadingMessage>
          ) : (
            <>
              <ProjectsTable>
                <thead>
                  <tr>
                    <TableHeaderCell>프로젝트명</TableHeaderCell>
                    <TableHeaderCell>시작일</TableHeaderCell>
                    <TableHeaderCell>종료일</TableHeaderCell>
                    <TableHeaderCell>상태</TableHeaderCell>
                    <TableHeaderCell>역할</TableHeaderCell>
                    <TableHeaderCell>액션</TableHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageProjects().map((project) => (
                    <TableRow 
              key={project.projectId} 
                      onClick={() => handleProjectClick(project.projectId)}
                    >
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{formatDate(project.startDate)}</TableCell>
                      <TableCell>{formatDate(project.endDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.deleted ? 'DELETED' : project.projectStatus}>
                  {getProjectStatus(project)}
                </StatusBadge>
                      </TableCell>
                      <TableCell>{project.myRole}</TableCell>
                      <TableCell>
                        <ActionButtonContainer>
                          {(project.myRole === 'DEVELOPER' || user.companyRole === 'ADMIN') && 
                           !project.deleted && 
                           project.projectStatus !== 'COMPLETED' && (
                            <ActionButton onClick={(e) => handleApprovalRequest(e, project.projectId)}>
                              승인요청
                            </ActionButton>
                          )}
                          {project.myRole === 'CLIENT' && !project.deleted && (
                            <ActionButton onClick={(e) => handleApprovalResponse(e, project.projectId)}>
                              승인응답
                            </ActionButton>
                          )}
                        </ActionButtonContainer>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </ProjectsTable>
              {filteredProjects.length > 0 && (
                <PaginationContainer>
                  <PaginationButton 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </PaginationButton>
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationNumber
                      key={index + 1}
                      active={currentPage === index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationNumber>
                  ))}
                  <PaginationButton
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </PaginationButton>
                </PaginationContainer>
              )}
            </>
          )}
        </ContentArea>
    </PageContainer>
    </NotificationProvider>
  );
};

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ef4444;
  font-size: 16px;
`;

const RetryButton = styled.button`
  display: block;
  margin: 16px auto;
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1b5e20;
  }
`;

export default UserProjectList;