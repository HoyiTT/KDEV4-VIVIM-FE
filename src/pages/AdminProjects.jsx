import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    description: '',
    isDeleted: false
  });

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  const fetchProjects = async (customFilters = filters, page = currentPage) => {
    try {
      setLoading(true);
      const hasActiveFilter = Object.values(customFilters).some(
        v => v !== '' && v !== false
      );
      let queryParams = '';
      if (hasActiveFilter) {
        const activeFilters = Object.entries(customFilters).reduce((acc, [key, value]) => {
          if (value !== '' && value !== false) {
            acc[key] = value;
          }
          return acc;
        }, {});
        queryParams = new URLSearchParams({
          ...activeFilters,
          page,
          size: 10
        }).toString();
      } else {
        queryParams = new URLSearchParams({
          page,
          size: 10
        }).toString();
      }
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS_SEARCH}?${queryParams}`);
      setProjects(data.content || []);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchProjects(filters, 0);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getProjectStatus = (status, deleted) => {
    if (deleted) {
      return '삭제됨';
    }
    switch (status) {
      case 'COMPLETED':
        return '완료됨';
      default:
        return '진행중';
    }
  };

  const getProgressStatus = (progress) => {
    switch (progress) {
      case 'REQUIREMENTS':
        return '요구사항';
      case 'WIREFRAME':
        return '와이어프레임';
      case 'DESIGN':
        return '디자인';
      case 'PUBLISHING':
        return '퍼블리싱';
      case 'DEVELOPMENT':
        return '개발';
      case 'TESTING':
        return '테스트';
      case 'DEPLOYMENT':
        return '배포';
      default:
        return progress;
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        const response = await axiosInstance.delete(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
          withCredentials: true,
          data: {
            projectId: projectId,
            deleteReason: '사용자에 의한 삭제'
          }
        });
        
        if (response.data.statusCode === 200) {
          alert('프로젝트가 삭제되었습니다.');
          fetchProjects();
        } else {
          alert('프로젝트 삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        if (error.response?.status === 403) {
          alert('프로젝트를 삭제할 권한이 없습니다.');
        } else {
          alert('프로젝트 삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  return (
    <PageContainer>
      <MainContent>
        <Card>
          <Header>
            <PageTitle>프로젝트 관리</PageTitle>
            <ButtonContainer>
              <AddButton onClick={() => navigate('/project-create')}>
                새 프로젝트 등록
              </AddButton>
            </ButtonContainer>
          </Header>

          <SearchSection>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <SearchInput
                type="text"
                placeholder="프로젝트명 검색"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
              />
              <SearchInput
                type="text"
                placeholder="설명 검색"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
              />
              <SearchCheckbox>
                <input
                  type="checkbox"
                  checked={filters.isDeleted}
                  name="isDeleted"
                  onChange={handleFilterChange}
                />
                삭제된 프로젝트만 검색
              </SearchCheckbox>
            </div>
            <div>
              <SearchButton onClick={handleSearch}>
                검색
              </SearchButton>
            </div>
          </SearchSection>
        </Card>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <ProjectTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>프로젝트명</TableHeaderCell>
                  <TableHeaderCell>프로젝트 비용</TableHeaderCell>
                  <TableHeaderCell>시작일</TableHeaderCell>
                  <TableHeaderCell>종료일</TableHeaderCell>
                  <TableHeaderCell>상태</TableHeaderCell>
                  <TableHeaderCell>진행상황</TableHeaderCell>
                  <TableHeaderCell>관리</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <TableRow key={project.projectId}>
                      <TableCell 
                        onClick={() => navigate(`/project/${project.projectId}`)}
                        style={{ cursor: 'pointer', color: '#1e293b' }}
                      >
                        {project.name}
                      </TableCell>
                      <TableCell>{project.projectFee.toLocaleString()}원</TableCell>
                      <TableCell>{project.startDate}</TableCell>
                      <TableCell>{project.endDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.projectStatus} deleted={project.deleted}>
                          {getProjectStatus(project.projectStatus, project.deleted)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ProgressBadge progress={project.currentProgress}>
                          {getProgressStatus(project.currentProgress)}
                        </ProgressBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButtonContainer>
                          <ActionButton onClick={() => navigate(`/projectModify/${project.projectId}`)}>
                            수정
                          </ActionButton>
                          <DeleteButton onClick={() => handleDeleteProject(project.projectId)}>
                            삭제
                          </DeleteButton>
                        </ActionButtonContainer>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="7" style={{ textAlign: 'center' }}>
                      등록된 프로젝트가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </ProjectTable>

            <PaginationContainer>
              <PaginationButton 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                이전
              </PaginationButton>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationButton
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  active={currentPage === i}
                >
                  {i + 1}
                </PaginationButton>
              ))}
              <PaginationButton 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage === totalPages - 1}
              >
                다음
              </PaginationButton>
            </PaginationContainer>
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
  
  &:before {
    content: '+';
    font-size: 18px;
    font-weight: 400;
  }

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  margin-bottom: 24px;
  overflow-x: auto;
  gap: 0;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
  min-width: 0;
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

const SearchCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #2E7D32;
  }
`;

const SearchButton = styled.button`
  padding: 10px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProjectTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin: 0 auto;
`;

const TableHeader = styled.thead`
  background: white;
`;

const TableBody = styled.tbody``;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'SUIT', sans-serif;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #0F172A;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'SUIT', sans-serif;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    if (props.deleted) return '#FEE2E2';
    switch (props.status) {
      case 'COMPLETED': return '#F0FDF4';
      default: return '#E0F2FE';
    }
  }};
  color: ${props => {
    if (props.deleted) return '#B91C1C';
    switch (props.status) {
      case 'COMPLETED': return '#15803D';
      default: return '#0369A1';
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

const ProgressBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    switch (props.progress) {
      case 'REQUIREMENTS': return '#FEF3C7';
      case 'WIREFRAME': return '#DBEAFE';
      case 'DESIGN': return '#FCE7F3';
      case 'PUBLISHING': return '#DCFCE7';
      case 'DEVELOPMENT': return '#E0E7FF';
      case 'TESTING': return '#FEF9C3';
      case 'DEPLOYMENT': return '#F3E8FF';
      default: return '#F1F5F9';
    }
  }};
  color: ${props => {
    switch (props.progress) {
      case 'REQUIREMENTS': return '#92400E';
      case 'WIREFRAME': return '#1E40AF';
      case 'DESIGN': return '#BE185D';
      case 'PUBLISHING': return '#166534';
      case 'DEVELOPMENT': return '#3730A3';
      case 'TESTING': return '#854D0E';
      case 'DEPLOYMENT': return '#6B21A8';
      default: return '#64748B';
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

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #C51111;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
  }

  &:active {
    transform: translateY(0);
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? '#2E7D32' : 'white'};
  border: 1px solid ${props => props.active ? '#2E7D32' : '#e2e8f0'};
  border-radius: 6px;
  color: ${props => props.active ? 'white' : '#1e293b'};
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#2E7D32' : '#f8fafc'};
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    border-color: #e2e8f0;
  }
`;

export default AdminProjects;
