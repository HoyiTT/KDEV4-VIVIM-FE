// src/pages/DashboardAdmin.jsx
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
} from 'chart.js';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    projectChange: 0,
    activeProjects: 0,
    activeChange: 0,
    completedProjects: 0,
    completedChange: 0,
    pendingInquiries: 0,
    inquiryChange: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [summaryData, setSummaryData] = useState([
    { title: '계약중인 프로젝트', value: 0 },
    { title: '검수중인 프로젝트', value: 0 },
    { title: '완료된 프로젝트', value: 0 }
  ]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 차트 데이터
  const projectStatusData = {
    labels: ['계약중', '검수중', '완료'],
    datasets: [
      {
        data: [8, 5, 15],
        backgroundColor: [
          '#2E7D32',
          '#FFA000',
          '#43A047'
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyStatsData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: '신규 프로젝트',
        data: [4, 6, 8, 5, 7, 9],
        backgroundColor: '#2E7D32',
      },
      {
        label: '완료 프로젝트',
        data: [3, 4, 6, 4, 5, 7],
        backgroundColor: '#66BB6A',
      },
    ],
  };

  const revenueData = {
    labels: ['1주차', '2주차', '3주차', '4주차', '5주차'],
    datasets: [
      {
        label: '프로젝트 금액',
        data: [15000000, 25000000, 18000000, 30000000, 22000000],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2E7D32',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ],
  };

  // 차트 옵션
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}개 (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  const formatCurrency = (value) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    } else {
      return `${value.toLocaleString()}원`;
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '진행중';
      case 'COMPLETED':
        return '완료';
      case 'ON_HOLD':
        return '보류';
      default:
        return '대기중';
    }
  };

  const getInquiryStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'IN_PROGRESS':
        return '처리중';
      case 'COMPLETED':
        return '완료';
      default:
        return '대기중';
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  useEffect(() => {
    const fetchProjectStatusData = async () => {
      try {
        const { data } = await axiosInstance.get('/projects/dashboard/progress_count');
        console.log('Project status data:', data);
      } catch (error) {
        console.error('Error fetching project status data:', error);
      }
    };
    fetchProjectStatusData();
  }, []);

  const chartData = useMemo(() => {
    const total = projectStatusData.datasets[0].data.reduce((sum, value) => sum + value, 0);
    return projectStatusData.datasets[0].data.map((value, index) => ({
      label: projectStatusData.labels[index],
      value: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
      color: projectStatusData.datasets[0].backgroundColor[index]
    }));
  }, [projectStatusData]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const { data } = await axiosInstance.get('/posts/admin/recent');
        setRecentPosts(data);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setRecentPosts([]);
      }
    };
    fetchRecentPosts();
  }, []);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const { data } = await axiosInstance.get('/projects/dashboard/inspection_count');
        setSummaryData([
          { title: '계약중인 프로젝트', value: data.progressCount || 0 },
          { title: '검수중인 프로젝트', value: data.inspectionCount || 0 },
          { title: '완료된 프로젝트', value: data.completedCount || 0 }
        ]);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setSummaryData([
          { title: '계약중인 프로젝트', value: 0 },
          { title: '검수중인 프로젝트', value: 0 },
          { title: '완료된 프로젝트', value: 0 }
        ]);
      }
    };
    fetchSummaryData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const { data } = await axiosInstance.get('/projects/dashboard/project_fee');
        console.log('Revenue data:', data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };
    fetchRevenueData();
  }, []);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data } = await axiosInstance.get('/admininquiry');
        setAdminInquiries(data);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };
    fetchInquiries();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/projects/dashboard/stats');
        setStats({
          totalProjects: data.totalProjects || 0,
          projectChange: data.projectChange || 0,
          activeProjects: data.activeProjects || 0,
          activeChange: data.activeChange || 0,
          completedProjects: data.completedProjects || 0,
          completedChange: data.completedChange || 0,
          pendingInquiries: data.pendingInquiries || 0,
          inquiryChange: data.inquiryChange || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchRecentProjects = async () => {
      try {
        const { data } = await axiosInstance.get('/projects/recent');
        setRecentProjects(data);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }
    };

    const fetchRecentInquiries = async () => {
      try {
        const { data } = await axiosInstance.get('/admininquiry/recent', {
          withCredentials: true
        });
        setRecentInquiries(data);
      } catch (error) {
        console.error('Error fetching recent inquiries:', error);
        setRecentInquiries([]);
      }
    };

    fetchStats();
    fetchRecentProjects();
    fetchRecentInquiries();
  }, []);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const { data } = await axiosInstance.get('/users/recent');
        setRecentUsers(data);
      } catch (error) {
        console.error('Error fetching recent users:', error);
        setRecentUsers([]);
      }
    };

    fetchRecentUsers();
  }, []);

  const handlePostClick = (postId, projectId) => {
    navigate(`/project/${projectId}/post/${postId}`);
  };

  const handleSummaryClick = async (title) => {
    setModalTitle(title);
    setShowModal(true);
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/projects/all');
      const filtered = data.filter(p => {
        if (title === '계약중인 프로젝트') return p.projectStatus === 'PROGRESS';
        if (title === '검수중인 프로젝트') return p.projectStatus === 'INSPECTION';
        return p.projectStatus === 'COMPLETED';
      });
      setProjectList(filtered);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjectList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryClick = (inquiryId) => {
    navigate(`/admin/inquiry/${inquiryId}`);
  };

  const handleViewAllInquiries = () => {
    navigate('/admin/inquiries');
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card>
              <CardTitle>시스템 현황</CardTitle>
              <CardContent>
                <StatsGrid>
                  <StatItem>
                    <StatLabel>계약한 프로젝트</StatLabel>
                    <StatValue>20</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>검수한 프로젝트</StatLabel>
                    <StatValue>1</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>검수중인 프로젝트</StatLabel>
                    <StatValue>1</StatValue>
                  </StatItem>
                </StatsGrid>
              </CardContent>
            </Card>

            <Card>
              <CardTitle>프로젝트 현황</CardTitle>
              <CardContent>
                <DoughnutChartSection>
                  <Doughnut 
                    data={{
                      labels: [
                        '요구사항정의',
                        '화면설계',
                        '디자인',
                        '개발',
                        '배포',
                        '검수',
                        '완료'
                      ],
                      datasets: [{
                        data: [8, 5, 12, 15, 7, 10, 20],
                        backgroundColor: [
                          '#FFD572',  // 요구사항정의
                          '#B785DB',  // 화면설계
                          '#647ACB',  // 디자인
                          '#7BC86C',  // 개발
                          '#8E6DA6',  // 배포
                          '#FF8A65',  // 검수
                          '#43A047'   // 완료
                        ],
                        borderWidth: 0,
                      }]
                    }} 
                    options={doughnutOptions}
                  />
                </DoughnutChartSection>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>관리자 문의 목록</CardTitle>
              <ViewAllButton onClick={handleViewAllInquiries}>
                전체보기
                <ArrowIcon>→</ArrowIcon>
              </ViewAllButton>
            </CardHeader>
            <CardContent>
              <InquiryList>
                {adminInquiries.slice(0, 5).map((inquiry) => (
                  <NoticeItem key={inquiry.id} onClick={() => handleInquiryClick(inquiry.id)}>
                    <NoticeInfo>
                      <NoticeTitle>{inquiry.title}</NoticeTitle>
                      <NoticeMeta>
                        <NoticeCreator>{inquiry.creatorName}</NoticeCreator>
                        <NoticeDate>{formatDate(inquiry.createdAt)}</NoticeDate>
                      </NoticeMeta>
                      <NoticeStatus status={inquiry.inquiryStatus}>
                        {getInquiryStatusText(inquiry.inquiryStatus)}
                      </NoticeStatus>
                    </NoticeInfo>
                  </NoticeItem>
                ))}
              </InquiryList>
            </CardContent>
          </Card>
        </div>

        <ProjectStatsCard>
          <ProjectStatsTitle>프로젝트 통계</ProjectStatsTitle>
          <ProjectStatsContent>
            <ProjectStatsGrid>
              <ProjectStatsSection>
                <ProjectStatsChartTitle>월별 프로젝트 통계</ProjectStatsChartTitle>
                <Bar data={monthlyStatsData} options={barOptions} />
              </ProjectStatsSection>
              <ProjectStatsSection>
                <ProjectStatsChartTitle>프로젝트 금액 통계</ProjectStatsChartTitle>
                <Line data={revenueData} options={lineOptions} />
              </ProjectStatsSection>
            </ProjectStatsGrid>
          </ProjectStatsContent>
        </ProjectStatsCard>

        <Card>
          <CardTitle>최근 게시물</CardTitle>
          <CardContent>
            <PostList>
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <PostItem key={post.id} onClick={() => handlePostClick(post.id, post.projectId)}>
                    <PostInfo>
                      <PostTitle>{post.title}</PostTitle>
                      <PostStatus status={post.status}>
                        {getStatusText(post.status)}
                      </PostStatus>
                    </PostInfo>
                    <PostDate>{formatDate(post.createdAt)}</PostDate>
                  </PostItem>
                ))
              ) : (
                <EmptyMessage>최근 게시물이 없습니다.</EmptyMessage>
              )}
            </PostList>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>최근 승인요청</CardTitle>
          <CardContent>
            <ProjectList>
              {recentProjects.map((project) => (
                <ProjectItem key={project.id} onClick={() => navigate(`/project/${project.id}`)}>
                  <ProjectInfo>
                    <ProjectName>{project.name}</ProjectName>
                    <ProjectStatus status={project.status}>
                      {getStatusText(project.status)}
                    </ProjectStatus>
                  </ProjectInfo>
                  <ProjectDate>{formatDate(project.createdAt)}</ProjectDate>
                </ProjectItem>
              ))}
            </ProjectList>
          </CardContent>
        </Card>
      </ContentWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{modalTitle}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <LoadingMessage>로딩 중...</LoadingMessage>
              ) : projectList.length > 0 ? (
                projectList.map(proj => (
                  <ProjectItem
                    key={proj.id}
                    onClick={() => navigate(`/project/${proj.projectId}`)}
                  >
                    <ProjectName>{proj.name}</ProjectName>
                    <ProjectInfo>
                      <CompanyName>{proj.companyName}</CompanyName>
                      <ProjectDate>
                        {new Date(proj.startDate).toLocaleDateString('ko-KR')} ~{' '}
                        {new Date(proj.endDate).toLocaleDateString('ko-KR')}
                      </ProjectDate>
                    </ProjectInfo>
                  </ProjectItem>
                ))
              ) : (
                <EmptyMessage>프로젝트가 없습니다.</EmptyMessage>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  flex: 1;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  flex: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
`;

const SystemStatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
  height: 320px;
`;

const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AdminInquirySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
`;

const AdminInquiryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const DoughnutChartSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  height: 300px;
  margin: 0 auto;
  position: relative;
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin-bottom: 0;
`;

const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 16px;
  text-align: center;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const UserDate = styled.div`
  font-size: 13px;
  color: #94a3b8;
`;

const InquiryProjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 32px;
`;

const InquirySection = styled.div`
  display: flex;
  flex-direction: column;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px 0 0;
  flex: 1;
  justify-content: flex-start;
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InquiryItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #ffffff;
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const ProjectItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const InquiryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InquiryItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
`;

const ProjectName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
`;

const InquiryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
`;

const InquiryCreator = styled.div`
  font-weight: 500;
  color: #475569;
`;

const ProjectCompany = styled.div`
  font-weight: 500;
  color: #475569;
`;

const ProjectDeadline = styled.div`
  color: #94a3b8;
`;

const InquiryDate = styled.div``;

const InquiryStatus = styled.div`
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#fff7ed';
      case 'IN_PROGRESS': return '#e8f5e9';
      case 'COMPLETED': return '#f1f5f9';
      case 'ON_HOLD': return '#fff7ed';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#c2410c';
      case 'IN_PROGRESS': return '#2E7D32';
      case 'COMPLETED': return '#64748b';
      case 'ON_HOLD': return '#c2410c';
      default: return '#64748b';
    }
  }};
`;

const ProjectStatus = styled.div`
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return '#e8f5e9';
      case 'COMPLETED': return '#f1f5f9';
      case 'ON_HOLD': return '#fff7ed';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return '#2E7D32';
      case 'COMPLETED': return '#64748b';
      case 'ON_HOLD': return '#c2410c';
      default: return '#64748b';
    }
  }};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 600px) {
    width: 95%;
  }
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
`;

const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const ProjectDate = styled.div`
  font-size: 13px;
  color: #94a3b8;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  height: 450px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
`;

const CompanyName = styled.span`
  font-weight: 500;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PostItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8fafc;
  }
`;

const PostInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PostTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
`;

const PostStatus = styled.div`
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return '#e8f5e9';
      case 'COMPLETED': return '#f1f5f9';
      case 'ON_HOLD': return '#fff7ed';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return '#2E7D32';
      case 'COMPLETED': return '#64748b';
      case 'ON_HOLD': return '#c2410c';
      default: return '#64748b';
    }
  }};
`;

const PostDate = styled.div`
  font-size: 13px;
  color: #94a3b8;
`;

const NoticeInquiryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const NoticeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoticeItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const NoticeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
`;

const NoticeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
`;

const NoticeCreator = styled.div`
  font-weight: 500;
  color: #475569;
`;

const NoticeDate = styled.div`
  color: #94a3b8;
`;

const NoticeStatus = styled.div`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#fff7ed';
      case 'IN_PROGRESS': return '#e8f5e9';
      case 'COMPLETED': return '#f1f5f9';
      case 'ON_HOLD': return '#fff7ed';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#c2410c';
      case 'IN_PROGRESS': return '#2E7D32';
      case 'COMPLETED': return '#64748b';
      case 'ON_HOLD': return '#c2410c';
      default: return '#64748b';
    }
  }};
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #475569;
  }
`;

const ArrowIcon = styled.span`
  font-size: 14px;
  transition: transform 0.2s ease;
  ${ViewAllButton}:hover & {
    transform: translateX(2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProjectStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProjectStatsCard = styled(Card)`
  margin-bottom: 0;
`;

const ProjectStatsTitle = styled(CardTitle)`
  margin-bottom: 16px;
`;

const ProjectStatsContent = styled(CardContent)`
  height: 100%;
  padding: 0;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
`;

const ProjectStatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  height: 300px;
`;

const ProjectStatsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ProjectStatsChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 12px;
  text-align: center;
`;

export default DashboardAdmin;