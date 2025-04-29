import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { PieChart } from 'react-minimal-pie-chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const DashboardAdmin = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentPosts, setRecentPosts] = useState([]);
  const [summaryData, setSummaryData] = useState([
    { title: '계약중인 프로젝트', value: 0 },
    { title: '검수중인 프로젝트', value: 0 },
    { title: '완료된 프로젝트', value: 0 },
  ]);
  const [revenueData, setRevenueData] = useState([
    { name: '1주차', amount: 0 },
    { name: '2주차', amount: 0 },
    { name: '3주차', amount: 0 },
    { name: '4주차', amount: 0 },
    { name: '5주차', amount: 0 },
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

  // 프로젝트 진행 현황 데이터 API 호출을 위한 useEffect 추가
  useEffect(() => {
    const fetchProjectStatusData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/projects/dashboard/progress_count`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch project status data');
        const data = await response.json();
        
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

  // chartData useMemo는 그대로 유지 (projectStatusData가 변경될 때마다 재계산)
  const chartData = useMemo(() => {
    const total = projectStatusData.reduce((sum, item) => sum + item.count, 0);
    return projectStatusData.map(item => ({
      ...item,
      value: Number(((item.count / total) * 100).toFixed(1))
    }));
  }, [projectStatusData]);

  

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/admin/recent`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch recent posts');
        const data = await response.json();
        console.log('최근 게시글 데이터:', data);
        setRecentPosts(data);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setRecentPosts([]);
      }
    };

    fetchRecentPosts();
  }, []);

  // API 호출을 위한 useEffect 추가
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/projects/dashboard/inspection_count`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch summary data');
        const data = await response.json();
        console.log('Summary data response:', data); // 전체 응답 데이터 로깅
        console.log('Progress count:', data.progressCount);
        console.log('Inspection count:', data.inspectionCount);
        console.log('Completed count:', data.completedCount);
        console.log('All keys:', Object.keys(data)); // 응답 데이터의 모든 키 확인
        
        setSummaryData([
          { title: '계약중인 프로젝트', value: data.progressCount || 0 },
          { title: '검수중인 프로젝트', value: data.inspectionCount || 0 },
          { title: '완료된 프로젝트', value: data.completedCount || 0 },
        ]);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setSummaryData([
          { title: '계약중인 프로젝트', value: 0 },
          { title: '검수중인 프로젝트', value: 0 },
          { title: '완료된 프로젝트', value: 0 },
        ]);
      }
    };

    fetchSummaryData();
  }, []);

  // 매출 데이터 API 호출을 위한 useEffect 추가
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/projects/dashboard/project_fee`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch revenue data');
        const data = await response.json();
        
        setRevenueData([
          { name: '1주차', amount: data.week1 },
          { name: '2주차', amount: data.week2 },
          { name: '3주차', amount: data.week3 },
          { name: '4주차', amount: data.week4 },
          { name: '5주차', amount: data.week5 },
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
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admininquiry`, {
          headers: {
            'Authorization': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          // 최신순으로 정렬하고 상위 4개만 표시
          const sortedData = data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
          setAdminInquiries(sortedData);
        } else {
          console.error('Failed to fetch inquiries');
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/all`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      
      // 프로젝트 상태 로깅 추가
      console.log('All projects:', data);
      console.log('Project statuses:', data.map(p => p.projectStatus));
      console.log('Completed projects:', data.filter(p => p.projectStatus === 'COMPLETED'));
      
      // 제목에 따라 프로젝트 필터링
      const filteredProjects = title === '계약중인 프로젝트'
        ? data.filter(project => project.projectStatus === 'PROGRESS')
        : title === '검수중인 프로젝트'
        ? data.filter(project => project.projectStatus === 'INSPECTION')
        : data.filter(project => project.projectStatus === 'COMPLETED');
      
      // 필터링 결과 로깅
      console.log('Filtered projects for title:', title);
      console.log('Filtered projects:', filteredProjects);
      console.log('Filtered projects count:', filteredProjects.length);
      console.log('Filtered projects statuses:', filteredProjects.map(p => p.projectStatus));
      
      setProjectList(filteredProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjectList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <TopSection>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', width: '100%' }}>
            <SummarySection>
              <SectionTitle>프로젝트 진행 현황 요약</SectionTitle>
              <SummaryGrid>
                {summaryData.map((item, index) => (
                  <SummaryCard 
                    key={index}
                    onClick={() => handleSummaryClick(item.title)}
                    style={{ cursor: 'pointer' }}
                  >
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
                    labelStyle={{ 
                      fontSize: '5px',
                      fill: '#fff',
                      fontWeight: '500'
                    }}
                    labelPosition={80}
                  />
                </ChartContainer>
                <ChartLegend>
                  {chartData.map((item, index) => (
                    <LegendItem key={index}>
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
          </div>

          <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
            <InquirySection>
              <SectionTitle 
                onClick={() => navigate('/admin-inquiry-list')} 
                style={{ cursor: 'pointer' }}
              >
                관리자 문의
              </SectionTitle>
              <InquiryList>
                {adminInquiries.map((inquiry) => (
                  <InquiryItem 
                    key={inquiry.id}
                    onClick={() => navigate(`/admin-inquiry-list/${inquiry.id}`)}
                  >
                    <InquiryHeader>
                      <InquiryTitle>{inquiry.title}</InquiryTitle>
                      <InquiryStatus status={inquiry.inquiryStatus}>
                        {inquiry.inquiryStatus === 'PENDING' ? '미답변' : 
                         inquiry.inquiryStatus === 'COMPLETED' ? '답변완료' : 
                         inquiry.inquiryStatus === 'IN_PROGRESS' ? '검토중' : inquiry.inquiryStatus}
                      </InquiryStatus>
                    </InquiryHeader>
                    <InquiryInfo>
                      <CompanyInfo>
                        {inquiry.creatorName}
                      </CompanyInfo>
                      <InquiryDate>
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\. /g, '.').slice(0, -1)}
                      </InquiryDate>
                    </InquiryInfo>
                  </InquiryItem>
                ))}
              </InquiryList>
            </InquirySection>

            <RevenueSection>
              <TitleRow>
                <SectionTitle>이번 달 매출 현황</SectionTitle>
                <RevenueAmount>총 매출: {revenueData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}만원</RevenueAmount>
              </TitleRow>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()}만원`, '매출']}
                    labelStyle={{ color: '#1e293b' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#82a6dd"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </RevenueSection>
          </div>
        </TopSection>

        <RecentPostSection>
          <SectionTitle>최근 게시글</SectionTitle>
          <PostList>
            {recentPosts.map((post) => (
              <PostItem 
                key={post.postId} 
                onClick={() => handlePostClick(post.postId, post.projectId)}
              >
                <PostCategory>
                  {post.projectPostStatus === 'NORMAL' ? '일반' :
                   post.projectPostStatus === 'QUESTION' ? '질문' :
                   post.projectPostStatus === 'NOTIFICATION' ? '공지' : post.projectPostStatus}
                </PostCategory>
                <PostTitle>{post.title}</PostTitle>
                <PostInfo>
                  <PostAuthor>{post.creatorName}</PostAuthor>
                  <PostDate>
                    {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\. /g, '.').slice(0, -1)}
                  </PostDate>
                </PostInfo>
              </PostItem>
            ))}
          </PostList>
        </RecentPostSection>
      </MainContent>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{modalTitle}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <LoadingMessage>로딩 중...</LoadingMessage>
              ) : projectList.length > 0 ? (
                <ProjectList>
                  {projectList.map((project) => (
                    <ProjectItem 
                      key={project.id}
                      onClick={() => navigate(`/project/${project.projectId}`)}
                    >
                      <ProjectName>{project.name}</ProjectName>
                      <ProjectInfo>
                        <CompanyName>{project.companyName}</CompanyName>
                        <ProjectDate>
                          {new Date(project.startDate).toLocaleDateString('ko-KR')} ~ 
                          {new Date(project.endDate).toLocaleDateString('ko-KR')}
                        </ProjectDate>
                      </ProjectInfo>
                    </ProjectItem>
                  ))}
                </ProjectList>
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
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.main`
  padding: 24px;
  margin: 60px auto 0;
  max-width: 1300px;
  width: calc(100% - 100px);
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0px;
`;

const ChartSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 380px;
`;

const ChartWrapper = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 0;
  align-items: center;
  justify-content: center;
`;

const ChartContainer = styled.div`
  width: 260px;
  height: 260px;
  flex-shrink: 0;
  margin: 0;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 0;
  min-width: 180px;
  padding: 0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

const LegendTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  margin-left: 4px;
`;

const SummarySection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 380px;
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  height: calc(100% - 40px);
  margin-top: 0px;
  padding: 10px 0;
`;

const SummaryCard = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70px;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #2E7D32;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;

  &::after {
    content: '건';
    font-size: 14px;
    color: #64748b;
  }
`;

const InquirySection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 420px;
  display: flex;
  flex-direction: column;
  
  ${SectionTitle} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    &::after {
      content: '더보기 >';
      font-size: 14px;
      color: #94a3b8;
      font-weight: normal;
      cursor: pointer;
      
      &:hover {
        color: #64748b;
      }
    }
  }
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const InquiryItem = styled.div`
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;

  &:hover {
    background: white;
    border-color: #e2e8f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const InquiryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const InquiryTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  margin-right: 16px;
  
  // 길어질 경우 말줄임표 처리
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InquiryStatus = styled.span`
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
  
  ${props => {
    switch (props.status) {
      case 'PENDING':
        return `
          background-color: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FCA5A5;
        `;
      case 'COMPLETED':
        return `
          background-color: #F0FDF4;
          color: #22C55E;
          border: 1px solid #86EFAC;
        `;
      case 'IN_PROGRESS':
        return `
          background-color: #F0F9FF;
          color: #0EA5E9;
          border: 1px solid #7DD3FC;
        `;
      default:
        return `
          background-color: #F8FAFC;
          color: #64748B;
          border: 1px solid #CBD5E1;
        `;
    }
  }}
`;

const InquiryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const CompanyInfo = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  
  // 회사명과 작성자 사이의 구분점 스타일
  & > span {
    color: #94a3b8;
    margin: 0 6px;
  }
`;

const InquiryDate = styled.span`
  font-size: 13px;
  color: #94a3b8;
`;

const RevenueSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 420px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const RevenueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #82a6dd;
  margin-bottom: 0;
`;

const RecentPostSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  gap: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const PostCategory = styled.span`
  background: ${props => {
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
  color: ${props => {
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
  white-space: nowrap;
`;

const PostTitle = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  flex: 1;
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostAuthor = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const PostDate = styled.span`
  font-size: 13px;
  color: #94a3b8;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProjectItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
  }
`;

const ProjectName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ProjectInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
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
  padding: 40px;
  color: #64748b;
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
`;

export default DashboardAdmin;