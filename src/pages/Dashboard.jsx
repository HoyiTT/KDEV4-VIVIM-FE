import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 더미 데이터
  const deadlineProjects = [
    {
      id: 1,
      name: '웹사이트 리뉴얼 프로젝트',
      remainingDays: 3,
      status: '진행중'
    },
    {
      id: 2,
      name: '모바일 앱 개발',
      remainingDays: 5,
      status: '검토중'
    },
    {
      id: 3,
      name: '데이터베이스 마이그레이션',
      remainingDays: 7,
      status: '진행중'
    }
  ];

  const recentApprovals = [
    {
      id: 1,
      title: '프로젝트 계획서 승인 요청',
      status: '대기중',
      createdAt: '2024-03-15T10:00:00'
    },
    {
      id: 2,
      title: '예산 변경 승인 요청',
      status: '승인됨',
      createdAt: '2024-03-14T15:30:00'
    },
    {
      id: 3,
      title: '인력 배치 승인 요청',
      status: '반려됨',
      createdAt: '2024-03-13T09:15:00'
    }
  ];

  const recentPosts = [
    {
      id: 1,
      title: '프로젝트 진행 상황 공유',
      author: '김철수',
      createdAt: '2024-03-15T14:20:00'
    },
    {
      id: 2,
      title: '팀 미팅 일정 안내',
      author: '이영희',
      createdAt: '2024-03-14T11:45:00'
    },
    {
      id: 3,
      title: '새로운 프로젝트 소개',
      author: '박지민',
      createdAt: '2024-03-13T16:30:00'
    }
  ];

  const recentInquiries = [
    {
      id: 1,
      title: '프로젝트 일정 문의',
      status: '답변완료',
      createdAt: '2024-03-15T09:00:00'
    },
    {
      id: 2,
      title: '기술 지원 요청',
      status: '처리중',
      createdAt: '2024-03-14T13:20:00'
    },
    {
      id: 3,
      title: '계약 관련 문의',
      status: '대기중',
      createdAt: '2024-03-13T15:45:00'
    }
  ];

  // 프로젝트 현황 차트 데이터
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

  // 월별 프로젝트 통계 차트 데이터
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

  // 금액 통계 차트 데이터
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
    plugins: {
      legend: {
        position: 'bottom',
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
            return (value / 1000000).toFixed(0) + 'M';
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
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return (value / 1000000).toFixed(0) + 'M';
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

  // 통계 데이터
  const stats = {
    totalProjects: 28,
    activeProjects: 12,
    completedProjects: 8,
    pendingInquiries: 5
  };

  return (
    <PageContainer>
      <Navbar />
      <MainContent>
        <DashboardGrid>
          <ChartSection>
            <LeftChartSection>
              <ChartCard>
                <ChartContent style={{ padding: '32px 32px 24px 32px' }}>
                  <ChartHeader>
                    <ChartTitle>프로젝트 현황</ChartTitle>
                  </ChartHeader>
                  <StatsGrid style={{ marginBottom: '20px' }}>
                    <StatItem>
                      <StatLabel>전체 프로젝트</StatLabel>
                      <StatValue>28</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>계약중</StatLabel>
                      <StatValue>8</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>검수중</StatLabel>
                      <StatValue>5</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>완료</StatLabel>
                      <StatValue>15</StatValue>
                    </StatItem>
                  </StatsGrid>
                  <ChartContainer style={{ minHeight: '180px', maxHeight: '220px' }}>
                    <Doughnut data={projectStatusData} options={doughnutOptions} />
                  </ChartContainer>
                </ChartContent>
              </ChartCard>
            </LeftChartSection>

            <RightChartSection>
              <ChartCard>
                <VerticalChartContent>
                  <ChartHeader>
                    <ChartTitle>주별 프로젝트 금액</ChartTitle>
                  </ChartHeader>
                  <ChartBody>
                    <LargeChartContainer>
                      <Line data={revenueData} options={lineOptions} />
                    </LargeChartContainer>
                    <ChartInfo>
                      <StatsGrid>
                        <StatItem>
                          <StatLabel>이번 주 금액</StatLabel>
                          <StatValue>2,200만원</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>평균 금액</StatLabel>
                          <StatValue>2,200만원</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>최대 금액</StatLabel>
                          <StatValue>3,000만원</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>총 금액</StatLabel>
                          <StatValue>1.1억원</StatValue>
                        </StatItem>
                      </StatsGrid>
                    </ChartInfo>
                  </ChartBody>
                </VerticalChartContent>
              </ChartCard>

              <ChartCard>
                <VerticalChartContent>
                  <ChartHeader>
                    <ChartTitle>월별 프로젝트 통계</ChartTitle>
                  </ChartHeader>
                  <ChartBody>
                    <LargeChartContainer>
                      <Bar data={monthlyStatsData} options={barOptions} />
                    </LargeChartContainer>
                    <ChartInfo>
                      <StatsGrid>
                        <StatItem>
                          <StatLabel>이번 달 신규</StatLabel>
                          <StatValue>9</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>이번 달 완료</StatLabel>
                          <StatValue>7</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>평균 진행일</StatLabel>
                          <StatValue>45일</StatValue>
                        </StatItem>
                        <StatItem>
                          <StatLabel>완료율</StatLabel>
                          <StatValue>75%</StatValue>
                        </StatItem>
                      </StatsGrid>
                    </ChartInfo>
                  </ChartBody>
                </VerticalChartContent>
              </ChartCard>
            </RightChartSection>
          </ChartSection>

          <ListSection>
            <Card>
              <SectionTitle>최근 문의사항</SectionTitle>
              <List>
                {recentInquiries.map(inquiry => (
                  <ItemCard key={inquiry.id} onClick={() => navigate(`/inquiry/${inquiry.id}`)}>
                    <InquiryTitle>{inquiry.title}</InquiryTitle>
                    <InquiryInfo>
                      <InfoLabel>상태</InfoLabel>
                      <InfoValue>{inquiry.status}</InfoValue>
                    </InquiryInfo>
                    <InquiryInfo>
                      <InfoLabel>작성일</InfoLabel>
                      <InfoValue>{new Date(inquiry.createdAt).toLocaleDateString()}</InfoValue>
                    </InquiryInfo>
                  </ItemCard>
                ))}
              </List>
            </Card>

            <Card>
              <SectionTitle>마감 임박 프로젝트</SectionTitle>
              <List>
                {deadlineProjects.map(project => (
                  <ItemCard key={project.id} onClick={() => navigate(`/project/${project.id}`)}>
                    <ProjectTitle>{project.name}</ProjectTitle>
                    <ProjectInfo>
                      <InfoLabel>남은 일수</InfoLabel>
                      <InfoValue>{project.remainingDays}일</InfoValue>
                    </ProjectInfo>
                    <ProjectInfo>
                      <InfoLabel>상태</InfoLabel>
                      <InfoValue>{project.status}</InfoValue>
                    </ProjectInfo>
                  </ItemCard>
                ))}
              </List>
            </Card>

            <Card>
              <SectionTitle>최근 게시글</SectionTitle>
              <List>
              {recentPosts.map(post => (
                  <ItemCard key={post.id} onClick={() => navigate(`/post/${post.id}`)}>
                    <PostTitle>{post.title}</PostTitle>
                    <PostInfo>
                      <InfoLabel>작성자</InfoLabel>
                      <InfoValue>{post.author}</InfoValue>
                    </PostInfo>
                    <PostInfo>
                      <InfoLabel>작성일</InfoLabel>
                      <InfoValue>{new Date(post.createdAt).toLocaleDateString()}</InfoValue>
                    </PostInfo>
                  </ItemCard>
                ))}
              </List>
            </Card>

            <Card>
              <SectionTitle>최근 승인요청</SectionTitle>
              <List>
                {recentApprovals.map(approval => (
                  <ItemCard key={approval.id} onClick={() => navigate(`/approval/${approval.id}`)}>
                    <ApprovalTitle>{approval.title}</ApprovalTitle>
                    <ApprovalInfo>
                      <InfoLabel>상태</InfoLabel>
                      <InfoValue>{approval.status}</InfoValue>
                    </ApprovalInfo>
                    <ApprovalInfo>
                      <InfoLabel>작성일</InfoLabel>
                      <InfoValue>{new Date(approval.createdAt).toLocaleDateString()}</InfoValue>
                    </ApprovalInfo>
                  </ItemCard>
                ))}
              </List>
            </Card>
          </ListSection>
        </DashboardGrid>
      </MainContent>
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 120px 32px 32px 272px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const ChartSection = styled.div`
  grid-column: span 3;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const LeftChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 450px;
`;

const RightChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ListSection = styled.div`
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 8px;
  width: 100%;
  box-sizing: border-box;

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
`;

const ItemCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const ChartCard = styled(Card)`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

const ChartContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;

const StatsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const StatItem = styled.div`
  font-size: 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 0;
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 160px;
  max-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  margin-top: 0;
`;

const LargeChartContainer = styled(ChartContainer)`
  min-height: 210px;
  max-height: none;
  flex: 2;
`;

const StatLabel = styled.span`
  color: #64748b;
  white-space: nowrap;
`;

const StatValue = styled.span`
  color: #1e293b;
  font-weight: 500;
  white-space: nowrap;
`;

const VerticalChartContent = styled(ChartContent)`
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

const ChartBody = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
`;

const ChartInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const RecentProjectsCard = styled(Card)``;

const RecentInquiriesCard = styled(Card)``;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProjectCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

const InquiryCard = styled(ProjectCard)``;

const ProjectTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const InquiryTitle = styled(ProjectTitle)``;

const ProjectInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InquiryInfo = styled(ProjectInfo)``;

const InfoLabel = styled.span`
  color: #64748b;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  font-size: 16px;
  color: #64748b;
`;

const RecentApprovalsCard = styled(Card)``;

const RecentPostsCard = styled(Card)``;

const ApprovalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ApprovalCard = styled(ProjectCard)``;

const PostCard = styled(ProjectCard)``;

const ApprovalTitle = styled(ProjectTitle)``;

const PostTitle = styled(ProjectTitle)``;

const ApprovalInfo = styled(ProjectInfo)``;

const PostInfo = styled(ProjectInfo)``;

export default Dashboard;