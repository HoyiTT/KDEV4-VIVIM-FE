import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const UserProjectList = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('프로젝트 관리');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;  // 'id' 대신 'userId' 사용

      const response = await fetch(`${API_ENDPOINTS.PROJECTS}?userId=${userId}`, {
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

  const getRoleBadgeText = (role) => {
    switch (role) {
      case 'CLIENT_USER':
        return '고객사(일반)';
      case 'CLIENT_MANAGER':
        return '고객사(담당자)';
      case 'DEVELOPER_USER':
        return '개발자(일반)';
      case 'DEVELOPER_MANAGER':
        return '개발자(담당자)';
      default:
        return role;
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
          <PageTitle>내 프로젝트</PageTitle>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <ProjectTable>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>프로젝트명</TableHeaderCell>
                <TableHeaderCell>내 역할</TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell 
                    onClick={() => navigate(`/project/${project.projectId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <RoleBadge>
                      {getRoleBadgeText(project.myRole)}
                    </RoleBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButtonContainer>
                      <ActionButton onClick={() => navigate(`/project/${project.projectId}`)}>
                        상세보기
                      </ActionButton>
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

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
`;

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

const ProjectTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
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
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
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

const RoleBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  background: rgba(79, 106, 255, 0.1);
  color: #4F6AFF;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

export default UserProjectList;