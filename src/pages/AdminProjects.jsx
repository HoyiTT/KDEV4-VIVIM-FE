import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
// Sidebar 대신 Navbar 컴포넌트 import
import Navbar from '../components/Navbar';

const AdminProjects = () => {
  const navigate = useNavigate();
  // activeMenuItem을 '프로젝트 관리 - 관리자'로 설정
  const [activeMenuItem, setActiveMenuItem] = useState('프로젝트 관리 - 관리자');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);


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
        <Header>
          <PageTitle>프로젝트 관리</PageTitle>
          <CreateButton onClick={() => navigate('/project-create')}>
            새 프로젝트
          </CreateButton>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
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
              {projects.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell 
                    onClick={() => navigate(`/project/${project.projectId}`)}
                    style={{ cursor: 'pointer', color: '#1e293b' }}
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
                    {!project.deleted && (
                      <ActionButtonContainer>
                        <ActionButton onClick={() => navigate(`/projectModify/${project.projectId}`)}>
                          수정
                        </ActionButton>
                        <DeleteButton 
                          onClick={() => handleDeleteProject(project.projectId)}
                          disabled={project.deleted}
                        >
                          삭제
                        </DeleteButton>
                      </ActionButtonContainer>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </ProjectsTable>
        )}
      </MainContent>
    </PageContainer>
  );
};

// DashboardContainer를 PageContainer로 변경
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
  margin-top: 60px; // 네비게이션바 높이만큼 여백 추가
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

const CreateButton = styled.button`
  padding: 10px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
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
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #C51111;
  }

  ${props => props.disabled && `
    background: #e2e8f0;
    cursor: not-allowed;
  `}
`;

export default AdminProjects;