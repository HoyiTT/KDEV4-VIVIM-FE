import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Move all styled components here, before the Dashboard component
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

const NotificationsSection = styled(StatisticsSection)``;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NotificationText = styled.div`
  font-size: 14px;
  color: #1e293b;
`;

const NotificationDate = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
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

// Add after other styled components, before Dashboard component
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

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockData = [
    { month: '1월', value: 65 },
    { month: '2월', value: 72 },
    { month: '3월', value: 68 },
    { month: '4월', value: 85 },
    { month: '5월', value: 78 },
    { month: '6월', value: 90 },
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
  const userId = decodedToken?.userId;  // Extract userId from token

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        isAdmin ? API_ENDPOINTS.ADMIN_PROJECTS : API_ENDPOINTS.USER_PROJECTS(userId),
        {
          headers: {
            'Authorization': token
          }
        }
      );
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);



  return (
    <PageContainer>
      {/* Sidebar 컴포넌트 제거하고 Navbar만 사용 */}
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>

        {/* 대시보드 내용 */}
        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <ContentContainer>
            <TopSection>
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

              <NotificationsSection>
                <SectionTitle>최근 알림</SectionTitle>
                <NotificationsList>
                  <NotificationItem>
                    <NotificationContent>
                      <NotificationText>프로젝트 A의 마감일이 3일 남았습니다.</NotificationText>
                      <NotificationDate>2024.01.15</NotificationDate>
                    </NotificationContent>
                  </NotificationItem>
                  <NotificationItem>
                    <NotificationContent>
                      <NotificationText>새로운 프로젝트가 할당되었습니다.</NotificationText>
                      <NotificationDate>2024.01.14</NotificationDate>
                    </NotificationContent>
                  </NotificationItem>
                  <NotificationItem>
                    <NotificationContent>
                      <NotificationText>프로젝트 B에 새로운 댓글이 있습니다.</NotificationText>
                      <NotificationDate>2024.01.13</NotificationDate>
                    </NotificationContent>
                  </NotificationItem>
                </NotificationsList>
              </NotificationsSection>
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
              
              <KPISection>
                <SectionTitle>생산성 지표 (KPI)</SectionTitle>
                <div className="kpi-grid">
                  <KPICard>
                    <h3>평균 업무 완료 시간</h3>
                    <div className="value">4.2일</div>
                  </KPICard>
                  <KPICard>
                    <h3>프로젝트 완료율</h3>
                    <div className="value">78%</div>
                  </KPICard>
                </div>
                <div className="chart-container" style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2E7D32" 
                        strokeWidth={2}
                        name="업무 처리량"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </KPISection>
              
              {/* Third section will be added later */}
            </BottomSection>
          </ContentContainer>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default Dashboard;