import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../config/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectProgress, setProjectProgress] = useState({});

  const mockData = [
    { month: '1월', value: 65 },
    { month: '2월', value: 72 },
    { month: '3월', value: 68 },
    { month: '4월', value: 85 },
    { month: '5월', value: 78 },
    { month: '6월', value: 90 },
  ];

  const mockPosts = [
    {
      id: 1,
      title: '프로젝트 진행 상황 보고',
      author: '김철수',
      date: '2024.01.15',
    },
    {
      id: 2,
      title: '주간 회의 일정 안내',
      author: '이영희',
      date: '2024.01.14',
    },
    {
      id: 3,
      title: '신규 프로젝트 킥오프 미팅',
      author: '박지민',
      date: '2024.01.13',
    },
    {
      id: 4,
      title: '1월 업무 목표 설정',
      author: '정민수',
      date: '2024.01.12',
    },
  ];

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const isAdmin = decodedToken?.role === 'ADMIN';
  const userId = decodedToken?.userId;

  const fetchProjectProgress = async (projectId) => {
    try {
      const response = await fetch(`https://dev.vivim.co.kr/api/projects/${projectId}/progress`, {
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      return data.progressList.sort((a, b) => a.position - b.position);
    } catch (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      
      if (isAdmin) {
        endpoint = API_ENDPOINTS.ADMIN_PROJECTS;
      } else {
        if (!userId) {
          console.error('User ID not found in token');
          setLoading(false);
          return;
        }
        endpoint = API_ENDPOINTS.USER_PROJECTS(userId);
      }
      
      console.log('Fetching projects from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Projects data:', data);
      setProjects(data);
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (token) {
        const projectsData = await fetchProjects();
        if (projectsData && projectsData.length > 0) {
          const progressData = {};
          // Get all non-deleted projects first
          const activeProjects = projectsData.filter(project => !project.deleted);
          // Then take the first 3 for progress data
          const projectsToShow = activeProjects.slice(0, 3);
          
          for (const project of projectsToShow) {
            progressData[project.projectId] = await fetchProjectProgress(project.projectId);
          }
          setProjectProgress(progressData);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, isAdmin]);

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <ContentWrapper>
        <Sidebar isAdmin={isAdmin} />
        <MainContent>
          {loading ? (
            <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
          ) : (
            <ContentContainer>
              <TopSection>
                <StatisticsSection>
                  <SectionTitle>프로젝트 현황</SectionTitle>
                  <StatisticsGrid>
                    <StatCard onClick={() => navigate(isAdmin ? '/admin-projects' : '/project-list')}>
                      <StatValue>{projects.length}</StatValue>
                      <StatLabel>전체 프로젝트</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>{projects.filter(p => !p.deleted).length}</StatValue>
                      <StatLabel>진행중인 프로젝트</StatLabel>
                    </StatCard>
                  </StatisticsGrid>
                </StatisticsSection>

                <RecentProjectsSection>
                  <SectionTitle>최근 프로젝트</SectionTitle>
                  <ProjectsTable>
                    <thead>
                      <tr>
                        <TableHeaderCell>프로젝트명</TableHeaderCell>
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
              </TopSection>
              
              <BottomSection>
                <CalendarSection>
                  <SectionTitle>일정</SectionTitle>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="ko-KR"
                    calendarType="gregory"
                  />
                </CalendarSection>
                
                <RecentPostsSection>
                  <SectionTitle>최근 게시글</SectionTitle>
                  <div className="posts-list">
                    {mockPosts.map(post => (
                      <PostItem key={post.id}>
                        <PostTitle>{post.title}</PostTitle>
                        <PostMeta>
                          <span>{post.author}</span>
                          <span>{post.date}</span>
                        </PostMeta>
                      </PostItem>
                    ))}
                  </div>
                </RecentPostsSection>
              
                <ProjectProgressSection>
                  <SectionTitle>프로젝트 진행 단계</SectionTitle>
                  <ProgressContainer>
                    {projects
                      .filter(project => !project.deleted)
                      .slice(0, 3)
                      .map(project => (
                        <ProgressItem key={project.projectId} onClick={() => navigate(`/project/${project.projectId}`)}>
                          <ProgressTitle>{project.name}</ProgressTitle>
                          <ProgressSteps>
                            {projectProgress[project.projectId]?.map((step, index) => (
                              <ProgressStep 
                                key={step.id}
                                active={true}
                                stepIndex={index}
                              >
                                {step.name}
                              </ProgressStep>
                            ))}
                          </ProgressSteps>
                        </ProgressItem>
                      ))}
                  </ProgressContainer>
                </ProjectProgressSection>

              </BottomSection>
            </ContentContainer>
          )}
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default Dashboard;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

// After PageContainer styled component
const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-top: 60px; // Navbar height
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-left: 250px; // Width of the sidebar
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

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
`;

const StatCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
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

const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
`;

const CalendarSection = styled(StatisticsSection)`
  .react-calendar {
    width: 100%;
    border: none;
    background: transparent;
    
    button {
      color: #1e293b;
      
      &:hover {
        background-color: #f1f5f9;
      }
      
      &:disabled {
        color: #cbd5e1;
      }
    }
    
    .react-calendar__tile--active {
      background: #2E7D32;
      color: white;
      
      &:hover {
        background: #1b5e20;
      }
    }
    
    .react-calendar__month-view__days__day--weekend {
      color: #ef4444;
    }
  }
`;

const KPISection = styled(StatisticsSection)`
  .chart-container {
    margin-top: 20px;
  }
  
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
`;

const KPICard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  
  h3 {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 8px 0;
  }
  
  .value {
    font-size: 24px;
    font-weight: 600;
    color: #2E7D32;
  }
`;

const RecentPostsSection = styled(StatisticsSection)`
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const PostItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const PostTitle = styled.div`
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
`;

const ProjectProgressSection = styled(StatisticsSection)`
  overflow: hidden;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const ProgressItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const ProgressTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const ProgressSteps = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ProgressStep = styled.div`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: ${props => props.active ? '600' : '400'};
  
  ${props => {
    // Define different colors for each step
    const colors = [
      { bg: 'rgba(46, 125, 50, 0.1)', text: '#2E7D32' },   // Green
      { bg: 'rgba(25, 118, 210, 0.1)', text: '#1976D2' },  // Blue
      { bg: 'rgba(245, 124, 0, 0.1)', text: '#F57C00' },   // Orange
      { bg: 'rgba(156, 39, 176, 0.1)', text: '#9C27B0' },  // Purple
      { bg: 'rgba(211, 47, 47, 0.1)', text: '#D32F2F' },   // Red
    ];
    
    // Use modulo to cycle through colors if there are more steps than colors
    const colorIndex = props.stepIndex % colors.length;
    const color = colors[colorIndex];
    
    if (props.active) {
      return `
        background: ${color.bg};
        color: ${color.text};
      `;
    } else {
      return `
        background: #f1f5f9;
        color: #64748b;
      `;
    }
  }}
`;
