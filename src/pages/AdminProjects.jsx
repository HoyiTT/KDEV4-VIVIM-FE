import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';
import Sidebar from '../components/Sidebar';
import Select from '../components/common/Select';

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

const SearchInputField = React.memo(({ name, placeholder, value, onChange, onKeyDown }) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };
  
  const handleCompositionEnd = (e) => {
    onChange({ target: { name, value: e.target.value, type: 'text' } });
  };
  
  const handleBlur = () => {
    onChange({ target: { name, value: localValue, type: 'text' } });
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onChange({ target: { name, value: localValue, type: 'text' } });
      if (onKeyDown) onKeyDown(e);
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };
  
  return (
    <SearchInput
      type="text"
      name={name}
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
    />
  );
});

SearchInputField.displayName = 'SearchInputField';

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchParams, setSearchParams] = useState({
    name: '',
    description: '',
    isDeleted: false
  });

  const [filters, setFilters] = useState({
    name: '',
    description: '',
    isDeleted: false
  });

  const itemsPerPage = 10;

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = () => {
    setFilters({ ...searchParams });
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage - 1,
        size: itemsPerPage,
        ...(filters.name && { name: filters.name }),
        ...(filters.description && { description: filters.description }),
        ...(filters.isDeleted && { isDeleted: true })
      }).toString();

      const response = await axiosInstance.get(`/projects/search?${queryParams}`, {
        withCredentials: true
      });
      setProjects(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      setProjects([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        const response = await axiosInstance.delete(`/projects/${projectId}`, {
          withCredentials: true,
          data: {
            projectId,
            deleteReason: '관리자에 의한 삭제'
          }
        });
        if (response.data.statusCode === 200) {
          alert('프로젝트가 삭제되었습니다.');
          fetchProjects();
        } else {
          alert('프로젝트 삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('프로젝트 삭제에 실패했습니다:', error);
        alert('프로젝트 삭제에 실패했습니다.');
      }
    }
  };

  // 현재 페이지의 프로젝트만 표시
  const getCurrentPageProjects = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return projects.slice(startIndex, endIndex);
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

  const getStatusColor = (project) => {
    if (project.deleted) {
      return { text: '삭제됨', color: '#B91C1C' };
    }
    switch (project.projectStatus) {
      case 'PENDING':
        return { text: '대기중', color: '#DC2626' };
      case 'IN_PROGRESS':
        return { text: '진행중', color: '#2E7D32' };
      case 'COMPLETED':
        return { text: '완료', color: '#64748B' };
      case 'ON_HOLD':
        return { text: '보류', color: '#F59E0B' };
      default:
        return { text: '대기중', color: '#64748B' };
    }
  };

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
    white-space: nowrap;

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
    white-space: nowrap;

    &:hover {
      background: #C51111;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
    }

    &:active {
      transform: translateY(0);
    }

    ${props => props.disabled && `
      background: #e2e8f0;
      cursor: not-allowed;
      &:hover {
        transform: none;
        box-shadow: none;
      }
    `}
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

  const SearchCard = styled.div`
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
  `;

  const SearchSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: nowrap;
    width: 100%;
  `;

  const StyledSelect = styled(Select)`
    width: 120px;
    padding: 10px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
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

  const AddButton = styled.button`
    padding: 10px 20px;
    background: #2E7D32;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;

    &:hover {
      background: #1B5E20;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
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

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PageTitle>프로젝트 관리</PageTitle>
              <AddButton onClick={() => navigate('/projectCreate')}>+ 새 프로젝트 등록</AddButton>
            </div>
            <SearchSection>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                <SearchInputField
                  name="name"
                  placeholder="프로젝트명 검색"
                  value={searchParams.name}
                  onChange={handleFilterChange}
                  onKeyDown={handleKeyPress}
                />
                <SearchInputField
                  name="description"
                  placeholder="프로젝트 설명 검색"
                  value={searchParams.description}
                  onChange={handleFilterChange}
                  onKeyDown={handleKeyPress}
                />
                <SearchCheckbox>
                  <input
                    type="checkbox"
                    name="isDeleted"
                    checked={searchParams.isDeleted}
                    onChange={handleFilterChange}
                  />
                  삭제된 프로젝트만 검색
                </SearchCheckbox>
              </div>
              <SearchButton onClick={handleSearch}>검색</SearchButton>
            </SearchSection>
          </div>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <ProjectsTable>
              <thead>
                <tr>
                  <TableHeaderCell>프로젝트명</TableHeaderCell>
                  <TableHeaderCell>시작일</TableHeaderCell>
                  <TableHeaderCell>종료일</TableHeaderCell>
                  <TableHeaderCell>상태</TableHeaderCell>
                  <TableHeaderCell>액션</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const statusColor = getStatusColor(project);
                  return (
                    <TableRow 
                      key={project.projectId}
                      onClick={() => handleProjectClick(project.projectId)}
                    >
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{formatDate(project.startDate)}</TableCell>
                      <TableCell>{formatDate(project.endDate)}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={project.deleted ? 'DELETED' : project.projectStatus}
                        >
                          {getProjectStatus(project)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        {!project.deleted && (
                          <ActionButtonContainer>
                            <ActionButton
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/projectModify/${project.projectId}`);
                              }}
                            >
                              수정
                            </ActionButton>
                            <DeleteButton
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteProject(project.projectId);
                              }}
                            >
                              삭제
                            </DeleteButton>
                          </ActionButtonContainer>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </ProjectsTable>
            {totalElements > 0 && (
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
      </MainContent>
    </PageContainer>
  );
};

export default AdminProjects;