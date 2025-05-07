// src/pages/DashboardAdmin.jsx
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { PieChart } from 'react-minimal-pie-chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentPosts, setRecentPosts] = useState([]);
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
  const [revenueData, setRevenueData] = useState([
    { name: '1주차', amount: 0 },
    { name: '2주차', amount: 0 },
    { name: '3주차', amount: 0 },
    { name: '4주차', amount: 0 },
    { name: '5주차', amount: 0 }
  ]);
  const [projectStatusData, setProjectStatusData] = useState([
    { title: '요구사항정의', count: 0, color: '#FFD572' },
    { title: '화면설계', count: 0, color: '#B785DB' },
    { title: '디자인', count: 0, color: '#647ACB' },
    { title: '개발', count: 0, color: '#7BC86C' },
    { title: '배포', count: 0, color: '#8E6DA6' },
    { title: '검수', count: 0, color: '#FF8A65' }
  ]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(false);

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
        setProjectStatusData([
          { title: '요구사항정의', count: data.requirementCount, color: '#FFD572' },
          { title: '화면설계', count: data.wireframeCount, color: '#B785DB' },
          { title: '디자인', count: data.designCount, color: '#647ACB' },
          { title: '개발', count: data.developCount, color: '#7BC86C' },
          { title: '배포', count: data.publishCount, color: '#8E6DA6' },
          { title: '검수', count: data.inspectionCount, color: '#FF8A65' }
        ]);
      } catch (error) {
        console.error('Error fetching project status data:', error);
      }
    };
    fetchProjectStatusData();
  }, []);

  const chartData = useMemo(() => {
    const total = projectStatusData.reduce((sum, item) => sum + item.count, 0);
    return projectStatusData.map(item => ({
      ...item,
      value: total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0
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
        setRevenueData([
          { name: '1주차', amount: data.week1 },
          { name: '2주차', amount: data.week2 },
          { name: '3주차', amount: data.week3 },
          { name: '4주차', amount: data.week4 },
          { name: '5주차', amount: data.week5 }
        ]);
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
        const sorted = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
        setAdminInquiries(sorted);
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
      }
    };

    fetchStats();
    fetchRecentProjects();
    fetchRecentInquiries();
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

  return (
    <PageContainer>
      <Navbar />
      <MainContent>
        <TopSection>
          <StatCard>
            <StatTitle>총 프로젝트</StatTitle>
            <StatValue>{stats.totalProjects}</StatValue>
            <StatChange isPositive={stats.projectChange > 0}>
              {stats.projectChange > 0 ? '↑' : '↓'} {Math.abs(stats.projectChange)}%
            </StatChange>
          </StatCard>
          <StatCard>
            <StatTitle>진행 중인 프로젝트</StatTitle>
            <StatValue>{stats.activeProjects}</StatValue>
            <StatChange isPositive={stats.activeChange > 0}>
              {stats.activeChange > 0 ? '↑' : '↓'} {Math.abs(stats.activeChange)}%
            </StatChange>
          </StatCard>
          <StatCard>
            <StatTitle>완료된 프로젝트</StatTitle>
            <StatValue>{stats.completedProjects}</StatValue>
            <StatChange isPositive={stats.completedChange > 0}>
              {stats.completedChange > 0 ? '↑' : '↓'} {Math.abs(stats.completedChange)}%
            </StatChange>
          </StatCard>
          <StatCard>
            <StatTitle>대기 중인 문의</StatTitle>
            <StatValue>{stats.pendingInquiries}</StatValue>
            <StatChange isPositive={stats.inquiryChange > 0}>
              {stats.inquiryChange > 0 ? '↑' : '↓'} {Math.abs(stats.inquiryChange)}%
            </StatChange>
          </StatCard>
        </TopSection>

        <ProjectSummaryCard>
          <ProjectSummaryTitle>프로젝트 진행 현황</ProjectSummaryTitle>
          <ProjectList>
            {recentProjects.map(project => (
              <ProjectCard key={project.id}>
                <ProjectHeader>
                  <ProjectTitle>{project.name}</ProjectTitle>
                  <ProjectStatus status={project.status}>
                    {getStatusText(project.status)}
                  </ProjectStatus>
                </ProjectHeader>
                <ProjectInfo>
                  <InfoRow>
                    <InfoLabel>고객사</InfoLabel>
                    <InfoValue>{project.customerName}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>시작일</InfoLabel>
                    <InfoValue>{formatDate(project.startDate)}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>종료일</InfoLabel>
                    <InfoValue>{formatDate(project.endDate)}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>진행률</InfoLabel>
                    <InfoValue>{project.progress}%</InfoValue>
                  </InfoRow>
                  <ProgressBar>
                    <Progress style={{ width: `${project.progress}%` }} />
                  </ProgressBar>
                </ProjectInfo>
              </ProjectCard>
            ))}
          </ProjectList>
        </ProjectSummaryCard>

        <RecentInquiriesCard>
          <SectionTitle>최근 문의사항</SectionTitle>
          <InquiryList>
            {recentInquiries.map(inquiry => (
              <InquiryItem key={inquiry.id}>
                <InquiryInfo>
                  <InquiryTitle>{inquiry.title}</InquiryTitle>
                  <InquiryMeta>
                    <span>{inquiry.customerName}</span>
                    <span>•</span>
                    <span>{formatDate(inquiry.createdAt)}</span>
                  </InquiryMeta>
                </InquiryInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <InquiryStatus status={inquiry.status}>
                    {getInquiryStatusText(inquiry.status)}
                  </InquiryStatus>
                  <ViewButton onClick={() => navigate(`/admin-inquiry-detail/${inquiry.id}`)}>
                    상세보기
                  </ViewButton>
                </div>
              </InquiryItem>
            ))}
          </InquiryList>
        </RecentInquiriesCard>
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
                    <ProjectItemInfo>
                      <CompanyName>{proj.companyName}</CompanyName>
                      <ProjectDate>
                        {new Date(proj.startDate).toLocaleDateString('ko-KR')} ~{' '}
                        {new Date(proj.endDate).toLocaleDateString('ko-KR')}
                      </ProjectDate>
                    </ProjectItemInfo>
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

// Styled components definitions

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 120px 32px 32px 272px;

  @media (max-width: 1200px) {
    padding: 120px 32px 32px 272px;
  }

  @media (max-width: 850px) {
    padding: 100px 32px 32px 32px;
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 0 8px;
  }
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const StatTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatChange = styled.div`
  font-size: 13px;
  color: ${props => props.isPositive ? '#2E7D32' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    background: #2E7D32;
    border-radius: 2px;
  }
`;

const ProjectSummaryCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
`;

const ProjectSummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    background: #2E7D32;
    border-radius: 2px;
  }
`;

const ProjectList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ProjectTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ProjectStatus = styled.div`
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 8px;
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

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: #64748b;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
`;

const Progress = styled.div`
  height: 100%;
  background: #2E7D32;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const RecentInquiriesCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InquiryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const InquiryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InquiryTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
`;

const InquiryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
`;

const InquiryStatus = styled.div`
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#fff7ed';
      case 'IN_PROGRESS': return '#e8f5e9';
      case 'COMPLETED': return '#f1f5f9';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#c2410c';
      case 'IN_PROGRESS': return '#2E7D32';
      case 'COMPLETED': return '#64748b';
      default: return '#64748b';
    }
  }};
`;

const ViewButton = styled.button`
  background: none;
  border: none;
  color: #2E7D32;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #e8f5e9;
  }
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

const ProjectItem = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  &:hover {
    background: #f1f5f9;
  }
`;

const ProjectName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const ProjectItemInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
`;

const CompanyName = styled.span`
  font-weight: 500;
`;

const ProjectDate = styled.span`
  color: #94a3b8;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
`;

export default DashboardAdmin;