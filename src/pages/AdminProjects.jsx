import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../utils/axiosInstance';

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
`;

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/projects/all?page=${currentPage - 1}&size=${itemsPerPage}`);
      setProjects(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error('프로젝트 목록을 불러오는데 실패했습니다:', error);
      setProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/projects/${projectId}`);
        // 삭제 후 프로젝트 목록 새로고침
        fetchProjects();
      } catch (error) {
        console.error('프로젝트 삭제에 실패했습니다:', error);
        alert('프로젝트 삭제에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  // 현재 페이지의 프로젝트만 표시
  const getCurrentPageProjects = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return projects.slice(startIndex, endIndex);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1);
  };

  const getProjectStatus = (status) => {
    switch (status) {
      case 'PROGRESS':
        return '진행중';
      case 'INSPECTION':
        return '검수중';
      case 'COMPLETED':
        return '완료';
      case 'DELETED':
        return '삭제됨';
      default:
        return '대기중';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROGRESS':
        return { bg: '#f1f5f9', text: '#334155' };
      case 'INSPECTION':
        return { bg: '#e2e8f0', text: '#475569' };
      case 'COMPLETED':
        return { bg: '#cbd5e1', text: '#64748b' };
      case 'DELETED':
        return { bg: '#94a3b8', text: '#f8fafc' };
      default:
        return { bg: '#f8fafc', text: '#94a3b8' };
    }
  };

  const TableHeaderCell = styled.th`
    padding: 16px 24px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    background: #f8fafc;
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

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <Header>
          <PageTitle>프로젝트 관리</PageTitle>
          <CreateButton onClick={() => navigate('/project-create')}>
            새 프로젝트
          </CreateButton>
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
                {getCurrentPageProjects().map((project) => {
                  const statusColor = getStatusColor(project.projectStatus);
                  return (
                    <TableRow key={project.projectId}>
                      <TableCell 
                        onClick={() => navigate(`/project/${project.projectId}`)}
                        style={{ cursor: 'pointer', color: '#1e293b' }}
                      >
                        {project.name}
                      </TableCell>
                      <TableCell>{formatDate(project.startDate)}</TableCell>
                      <TableCell>{formatDate(project.endDate)}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          style={{ 
                            background: statusColor.bg,
                            color: statusColor.text
                          }}
                        >
                          {getProjectStatus(project.projectStatus)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        {project.projectStatus !== 'DELETED' && (
                          <ActionButtonContainer>
                            <ActionButton onClick={() => navigate(`/projectModify/${project.projectId}`)}>
                              수정
                            </ActionButton>
                            <DeleteButton 
                              onClick={() => handleDeleteProject(project.projectId)}
                              disabled={project.projectStatus === 'DELETED'}
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
            {projects.length > 0 && (
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

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  margin-left: 15px;
  overflow-y: auto;
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
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: #2E7D32;
    border-radius: 2px;
  }
`;

const CreateButton = styled.button`
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

export default AdminProjects;