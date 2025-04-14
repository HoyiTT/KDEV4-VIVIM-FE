import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const AdminProjectList = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('프로젝트 관리 - 관리자');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ADMIN_PROJECTS, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // Add delete project function
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (response.ok) {
          alert('프로젝트가 삭제되었습니다.');
          fetchProjects(); // Refresh the project list
        } else {
          alert('프로젝트 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('프로젝트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem} 
        handleMenuClick={handleMenuClick} 
      />
      <MainContent>
        <Header>
          <PageTitle>프로젝트 목록 (관리자)</PageTitle>
          <AddButton onClick={() => navigate('/projectCreate')}>
            새 프로젝트 등록
          </AddButton>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <ProjectTable>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>프로젝트명</TableHeaderCell>
                <TableHeaderCell>시작일</TableHeaderCell>
                <TableHeaderCell>종료일</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell 
                    onClick={() => navigate(`/project/${project.projectId}`)}
                    style={{ cursor: 'pointer', color: '#2E7D32' }}
                  >
                    {project.name}
                  </TableCell>
                  <TableCell>{project.startDate}</TableCell>
                  <TableCell>{project.endDate}</TableCell>
                  <TableCell>
                    <StatusBadge deleted={project.deleted}>
                      {project.deleted ? '삭제됨' : '진행중'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButtonContainer>
                      <ActionButton onClick={() => navigate(`/projectModify/${project.projectId}`)}>
                        수정하기
                      </ActionButton>
                      <DeleteButton 
                        onClick={() => handleDeleteProject(project.projectId)}
                        disabled={project.deleted}
                      >
                        삭제하기
                      </DeleteButton>
                    </ActionButtonContainer>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ProjectTable>
        )}
      </MainContent>
    </PageContainer>
  );
};

// DashboardContainer를 PageContainer로 변경하고 flex-direction을 column으로 설정
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

// MainContent 스타일 수정
const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

// 나머지 스타일 컴포넌트는 그대로 유지
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1B5E20;
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
  background: #f8fafc;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  
  ${props => props.deleted ? `
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  ` : `
    background: rgba(46, 125, 50, 0.1);
    color: #2E7D32;
  `}
`;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #4F6AFF;
  border: 1px solid #4F6AFF;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(79, 106, 255, 0.1);
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: ${props => props.disabled ? '#94a3b8' : '#EF4444'};
  border: 1px solid ${props => props.disabled ? '#94a3b8' : '#EF4444'};
  border-radius: 6px;
  font-size: 13px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.disabled ? 'transparent' : 'rgba(239, 68, 68, 0.1)'};
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

export default AdminProjectList;