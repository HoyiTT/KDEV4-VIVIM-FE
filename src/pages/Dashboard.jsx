import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
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

  return (
    <PageContainer>
      {/* Sidebar 컴포넌트 제거하고 Navbar만 사용 */}
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <Header>
          <PageTitle>대시보드</PageTitle>
        </Header>

        {/* 대시보드 내용 */}
        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <ContentContainer>
            <StatisticsSection>
              <SectionTitle>프로젝트 현황</SectionTitle>
              <StatisticsGrid>
                <StatCard>
                  <StatValue>{projects.length}</StatValue>
                  <StatLabel>전체 프로젝트</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{projects.filter(p => !p.deleted).length}</StatValue>
                  <StatLabel>진행중인 프로젝트</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{projects.filter(p => p.deleted).length}</StatValue>
                  <StatLabel>종료된 프로젝트</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>12</StatValue>
                  <StatLabel>참여 인원</StatLabel>
                </StatCard>
              </StatisticsGrid>
            </StatisticsSection>

            <RecentProjectsSection>
              <SectionTitle>최근 프로젝트</SectionTitle>
              <ProjectsTable>
                <thead>
                  <tr>
                    <TableHeaderCell>프로젝트명</TableHeaderCell>
                    <TableHeaderCell>시작일</TableHeaderCell>
                    <TableHeaderCell>종료일</TableHeaderCell>
                    <TableHeaderCell>상태</TableHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((project) => (
                    <TableRow 
                      key={project.projectId}
                      onClick={() => navigate(`/project/${project.projectId}`)}
                    >
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.startDate}</TableCell>
                      <TableCell>{project.endDate}</TableCell>
                      <TableCell>
                        <StatusBadge deleted={project.deleted}>
                          {project.deleted ? '삭제됨' : '진행중'}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </ProjectsTable>
            </RecentProjectsSection>
          </ContentContainer>
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
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

// 기존 스타일 컴포넌트 아래에 추가

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const StatisticsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #2E7D32;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const RecentProjectsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const ProjectsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
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
  padding: 16px 12px;
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

export default Dashboard;