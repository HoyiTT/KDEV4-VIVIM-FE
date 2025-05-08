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
import MainContent from '../components/common/MainContent';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user || user.companyRole !== 'ADMIN') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
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
  const [revenueData, setRevenueData] = useState({
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
  });
  const [recentProposals, setRecentProposals] = useState([]);

  // 차트 데이터
  const projectStatusData = {
    labels: ['계약중', '검수중', '완료'],
    datasets: [
      {
        data: [0, 0, 0],
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
        // 프로젝트 현황 데이터 업데이트
        setSummaryData([
          { title: '계약중인 프로젝트', value: data.progressCount || 0 },
          { title: '검수중인 프로젝트', value: data.inspectionCount || 0 },
          { title: '완료된 프로젝트', value: data.completedCount || 0 }
        ]);
      } catch (error) {
        console.error('Error fetching project status data:', error);
      }
    };

    const fetchRevenueData = async () => {
      try {
        const { data } = await axiosInstance.get('/projects/dashboard/project_fee');
        console.log('Revenue data:', data);
        // 수익 데이터 업데이트
        const revenueData = {
          labels: ['1주차', '2주차', '3주차', '4주차', '5주차'],
          datasets: [
            {
              label: '프로젝트 금액',
              data: [
                data.week1 || 0,
                data.week2 || 0,
                data.week3 || 0,
                data.week4 || 0,
                data.week5 || 0
              ],
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
        // setRevenueData(revenueData); // API 데이터 대신 더미 데이터 사용
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    fetchProjectStatusData();
    fetchRevenueData();
  }, []);

  useEffect(() => {
    console.log('useEffect for recent posts triggered');
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      console.log('Fetching recent posts...');
      const { data } = await axiosInstance.get('/posts/admin/recent', {
        withCredentials: true
      });
      console.log('Recent posts data:', data);
      setRecentPosts(data);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      setRecentPosts([]);
    }
  };

  useEffect(() => {
    const fetchAdminInquiries = async () => {
      try {
        const { data } = await axiosInstance.get('/admininquiry', {
          withCredentials: true
        });
        console.log('Admin inquiries data:', data);
        setAdminInquiries(data);
      } catch (error) {
        console.error('Error fetching admin inquiries:', error);
        setAdminInquiries([]);
      }
    };

    fetchAdminInquiries();
  }, []);

  useEffect(() => {
    const fetchRecentProposals = async () => {
      try {
        const { data } = await axiosInstance.get('/proposals/recent');
        console.log('Recent proposals data:', data);
        setRecentProposals(data.approvalList || []);
      } catch (error) {
        console.error('Error fetching recent proposals:', error);
        setRecentProposals([]);
      }
    };

    fetchRecentProposals();
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

  const handleProposalClick = (proposalId) => {
    navigate(`/admin/proposal/${proposalId}`);
  };

  return (
    <PageContainer>
      <MainContent>
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
                    <StatLabel>검수중인 프로젝트</StatLabel>
                    <StatValue>1</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>검수한 프로젝트</StatLabel>
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
                          '#e8f5e9',  // 요구사항정의 - 가장 밝은 녹색
                          '#c8e6c9',  // 화면설계
                          '#a5d6a7',  // 디자인
                          '#81c784',  // 개발
                          '#66bb6a',  // 배포
                          '#4caf50',  // 검수
                          '#2E7D32'   // 완료 - 시그니처 색상
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
                {adminInquiries.length > 0 ? (
                  adminInquiries.slice(0, 5).map((inquiry) => (
                    <NoticeItem key={inquiry.id} onClick={() => handleInquiryClick(inquiry.id)}>
                      <NoticeInfo>
                        <NoticeTitle>{inquiry.title}</NoticeTitle>
                        <NoticeMeta>
                          <NoticeCreator>{inquiry.creatorName}</NoticeCreator>
                          <NoticeDate>{formatDate(inquiry.createdAt)}</NoticeDate>
                        </NoticeMeta>
                      </NoticeInfo>
                      <NoticeStatus status={inquiry.inquiryStatus}>
                        {getInquiryStatusText(inquiry.inquiryStatus)}
                      </NoticeStatus>
                    </NoticeItem>
                  ))
                ) : (
                  <EmptyMessage>관리자 문의가 없습니다.</EmptyMessage>
                )}
              </InquiryList>
            </CardContent>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Card>
            <CardTitle>최근 게시물</CardTitle>
            <CardContent>
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <ProjectItem key={post.postId} onClick={() => navigate(`/project/${post.projectId}/post/${post.postId}`)}>
                    <ProjectInfo>
                      <ProjectName>{post.title}</ProjectName>
                      <ProjectDate>
                        {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\. /g, '.').slice(0, -1)}
                      </ProjectDate>
                    </ProjectInfo>
                    <ProjectStatus status={post.status}>
                      {post.creatorName}
                    </ProjectStatus>
                  </ProjectItem>
                ))
              ) : (
                <EmptyMessage>최근 게시물이 없습니다.</EmptyMessage>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardTitle>최근 승인요청</CardTitle>
            <CardContent>
              <ProjectList>
                {recentProposals.length > 0 ? (
                  recentProposals.map((proposal) => (
                    <ProjectItem key={proposal.id} onClick={() => handleProposalClick(proposal.id)}>
                      <ProjectInfo>
                        <ProjectName>{proposal.title}</ProjectName>
                        <ProjectDate>{formatDate(proposal.createdAt)}</ProjectDate>
                      </ProjectInfo>
                      <ProjectStatus status={proposal.approvalProposalStatus}>
                        {getInquiryStatusText(proposal.approvalProposalStatus)}
                      </ProjectStatus>
                    </ProjectItem>
                  ))
                ) : (
                  <EmptyMessage>최근 승인요청이 없습니다.</EmptyMessage>
                )}
              </ProjectList>
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
      </MainContent>

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
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1400px;
  padding: 10px;
  margin: 20px auto;
  box-sizing: border-box;
  width: 100%;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8fafc;
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
  gap: 16px;
`;

const NoticeItem = styled.div`
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
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#FEF3C7';
      case 'IN_PROGRESS': return '#DBEAFE';
      case 'COMPLETED': return '#DCFCE7';
      case 'ON_HOLD': return '#FEE2E2';
      default: return '#F8FAFC';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#D97706';
      case 'IN_PROGRESS': return '#2563EB';
      case 'COMPLETED': return '#16A34A';
      case 'ON_HOLD': return '#DC2626';
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

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProjectItem = styled.div`
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

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProjectName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
`;

const ProjectStatus = styled(NoticeStatus)``;

const ProjectDate = styled.div`
  font-size: 11px;
  color: #94a3b8;
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
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

const PostTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
`;

const PostAuthor = styled.div`
  font-weight: 500;
  color: #475569;
`;

const PostDate = styled.div`
  color: #94a3b8;
`;

const PostStatus = styled(NoticeStatus)``;

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

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const ArrowIcon = styled.span`
  font-size: 14px;
  transition: transform 0.2s ease;
  ${ViewAllButton}:hover & {
    transform: translateX(4px);
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
  height: 400px;
  width: 100%;
  overflow: hidden;
`;

const ProjectStatsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const ProjectStatsChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 12px;
  text-align: center;
`;

export default DashboardAdmin;