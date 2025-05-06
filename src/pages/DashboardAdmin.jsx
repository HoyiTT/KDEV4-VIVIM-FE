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
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentPosts, setRecentPosts] = useState([]);
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

  const navigate = useNavigate();

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
      <Navbar activeMenuItem={activeMenuItem} handleMenuClick={handleMenuClick} />
      <MainContent>
        <TopSection>
          <SummarySection>
            <ProjectSummaryTitle>프로젝트 진행현황 요약</ProjectSummaryTitle>
            <SummaryGrid>
              {summaryData.map((item, idx) => (
                <SummaryCard key={idx} onClick={() => handleSummaryClick(item.title)}>
                  <SummaryTitle>{item.title}</SummaryTitle>
                  <SummaryValue>{item.value}</SummaryValue>
                </SummaryCard>
              ))}
            </SummaryGrid>
          </SummarySection>
          <ChartSection>
            <SectionTitle>진행중인 단계별 프로젝트 비율</SectionTitle>
            <ChartWrapper>
              <ChartContainer>
                <PieChart
                  data={chartData}
                  lineWidth={45}
                  paddingAngle={2}
                  label={({ dataEntry }) => `${dataEntry.value}%`}
                  labelStyle={{ fontSize: '5px', fill: '#fff', fontWeight: '500' }}
                  labelPosition={80}
                />
              </ChartContainer>
              <ChartLegend>
                {chartData.map((item, idx) => (
                  <LegendItem key={idx}>
                    <LegendColor color={item.color} />
                    <LegendTextWrapper>
                      <LegendTitle>{item.title}</LegendTitle>
                      <LegendCount>
                        <span>{item.count}건</span>
                        <LegendPercent>({item.value}%)</LegendPercent>
                      </LegendCount>
                    </LegendTextWrapper>
                  </LegendItem>
                ))}
              </ChartLegend>
            </ChartWrapper>
          </ChartSection>
        </TopSection>

        <TopSection>
          <InquirySection>
            <SectionTitle onClick={() => navigate('/admin-inquiry-list')}>
              관리자 문의
            </SectionTitle>
            <InquiryList>
              {adminInquiries.map(i => (
                <InquiryItem
                  key={i.id}
                  onClick={() => navigate(`/admin-inquiry-list/${i.id}`)}
                >
                  <InquiryHeader>
                    <InquiryTitle>{i.title}</InquiryTitle>
                    <InquiryStatus status={i.inquiryStatus}>
                      {i.inquiryStatus === 'PENDING'
                        ? '미답변'
                        : i.inquiryStatus === 'IN_PROGRESS'
                        ? '검토중'
                        : '답변완료'}
                    </InquiryStatus>
                  </InquiryHeader>
                  <InquiryInfo>
                    <CompanyInfo>{i.creatorName}</CompanyInfo>
                    <InquiryDate>
                      {new Date(i.createdAt)
                        .toLocaleDateString('ko-KR')
                        .replace(/\. /g, '.')
                        .slice(0, -1)}
                    </InquiryDate>
                  </InquiryInfo>
                </InquiryItem>
              ))}
            </InquiryList>
          </InquirySection>
          <RevenueSection>
            <TitleRow>
              <SectionTitle>이번 달 매출 현황</SectionTitle>
              <RevenueAmount>
                총 매출: {revenueData.reduce((sum, it) => sum + it.amount, 0).toLocaleString()}만원
              </RevenueAmount>
            </TitleRow>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={val => [`${val.toLocaleString()}만원`, '매출']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </RevenueSection>
        </TopSection>

        <RecentPostSection>
          <SectionTitle>최근 게시글</SectionTitle>
          <PostList>
            {recentPosts.map(p => (
              <PostItem key={p.postId} onClick={() => handlePostClick(p.postId, p.projectId)}>
                <PostCategory>
                  {p.projectPostStatus === 'NORMAL'
                    ? '일반'
                    : p.projectPostStatus === 'QUESTION'
                    ? '질문'
                    : '공지'}
                </PostCategory>
                <PostTitle>{p.title}</PostTitle>
                <PostInfo>
                  <PostAuthor>{p.creatorName}</PostAuthor>
                  <PostDate>
                    {new Date(p.createdAt)
                      .toLocaleDateString('ko-KR')
                      .replace(/\. /g, '.')
                      .slice(0, -1)}
                  </PostDate>
                </PostInfo>
              </PostItem>
            ))}
          </PostList>
        </RecentPostSection>
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

// Styled components definitions

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI,
    Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
`;

const MainContent = styled.main`
  padding: 24px;
  margin: 60px auto 0;
  max-width: 1300px;
  width: calc(100% - 100px);
`;

const TopSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const ProjectSummaryTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
`;

const SummarySection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryCard = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #2e7d32;
  &::after {
    content: '건';
    font-size: 14px;
    color: #64748b;
  }
`;

const ChartSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
`;

const ChartWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const ChartContainer = styled.div`
  width: 260px;
  height: 260px;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${(props) => props.color};
`;

const LegendTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LegendTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const LegendCount = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const LegendPercent = styled.span`
  color: #94a3b8;
`;

const InquirySection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
`;

const InquiryItem = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: white;
  }
`;

const InquiryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const InquiryTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
`;

const InquiryStatus = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  ${(props) => {
    switch (props.status) {
      case 'PENDING':
        return `
          background: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FCA5A5;
        `;
      case 'IN_PROGRESS':
        return `
          background: #F0F9FF;
          color: #0EA5E9;
          border: 1px solid #7DD3FC;
        `;
      case 'COMPLETED':
        return `
          background: #F0FDF4;
          color: #22C55E;
          border: 1px solid #86EFAC;
        `;
      default:
        return `
          background: #F8FAFC;
          color: #64748B;  
          border: 1px solid #CBD5E1;
        `;
    }
  }}
`;

const InquiryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
`;

const CompanyInfo = styled.span``;

const InquiryDate = styled.span`
  color: #94a3b8;
`;

const RevenueSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const RevenueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #82a6dd;
`;

const RecentPostSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PostItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f1f5f9;
  }
`;

const PostCategory = styled.span`
  background: ${(props) => {
    switch (props.children) {
      case '질문':
        return '#E3F2FD';
      case '일반':
        return '#E8F5E9';
      case '공지':
        return '#F3E5F5';
      default:
        return '#e2e8f0';
    }
  }};
  color: ${(props) => {
    switch (props.children) {
      case '질문':
        return '#1976D2';
      case '일반':
        return '#2E7D32';
      case '공지':
        return '#9C27B0';
      default:
        return '#475569';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const PostTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
`;

const PostInfo = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
`;

const PostAuthor = styled.span``;

const PostDate = styled.span`
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

const ProjectInfo = styled.div`
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