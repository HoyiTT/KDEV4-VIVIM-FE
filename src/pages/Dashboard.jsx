import React, { useState, useEffect } from 'react';
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
      <ContentWrapper>
        <Card>
          <CardTitle>프로젝트 현황</CardTitle>
          <CardContent>
            <ProjectStats>
              <StatItem>
                <StatLabel>전체 프로젝트</StatLabel>
                <StatValue>{stats.totalProjects}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>진행중</StatLabel>
                <StatValue>{stats.activeProjects}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>완료</StatLabel>
                <StatValue>{stats.completedProjects}</StatValue>
              </StatItem>
            </ProjectStats>
            <ChartContainer>
              <Doughnut data={projectStatusData} options={doughnutOptions} />
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>월별 프로젝트 통계</CardTitle>
          <CardContent>
            <ChartContainer>
              <Bar data={monthlyStatsData} options={barOptions} />
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>프로젝트 금액 통계</CardTitle>
          <CardContent>
            <ChartContainer>
              <Line data={revenueData} options={lineOptions} />
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>최근 프로젝트</CardTitle>
          <CardContent>
            <ProjectList>
              {deadlineProjects.map((project) => (
                <ProjectItem key={project.id} onClick={() => navigate(`/project/${project.id}`)}>
                  <ProjectInfo>
                    <ProjectName>{project.name}</ProjectName>
                    <ProjectStatus status={project.status}>
                      {project.status === '진행중' ? '진행중' : '검토중'}
                    </ProjectStatus>
                  </ProjectInfo>
                  <ProjectDate>{project.remainingDays}일</ProjectDate>
                </ProjectItem>
              ))}
            </ProjectList>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>최근 게시글</CardTitle>
          <CardContent>
            <PostList>
              {recentPosts.map((post) => (
                <PostItem key={post.id} onClick={() => navigate(`/post/${post.id}`)}>
                  <PostInfo>
                    <PostTitle>{post.title}</PostTitle>
                    <PostAuthor>{post.author}</PostAuthor>
                  </PostInfo>
                  <PostDate>{new Date(post.createdAt).toLocaleDateString()}</PostDate>
                </PostItem>
              ))}
            </PostList>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>최근 승인요청</CardTitle>
          <CardContent>
            <ApprovalList>
              {recentApprovals.map((approval) => (
                <ApprovalItem key={approval.id} onClick={() => navigate(`/approval/${approval.id}`)}>
                  <ApprovalInfo>
                    <ApprovalTitle>{approval.title}</ApprovalTitle>
                    <ApprovalStatus>{approval.status}</ApprovalStatus>
                  </ApprovalInfo>
                  <ApprovalDate>{new Date(approval.createdAt).toLocaleDateString()}</ApprovalDate>
                </ApprovalItem>
              ))}
            </ApprovalList>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>최근 문의사항</CardTitle>
          <CardContent>
            <InquiryList>
              {recentInquiries.map((inquiry) => (
                <InquiryItem key={inquiry.id} onClick={() => navigate(`/inquiry/${inquiry.id}`)}>
                  <InquiryInfo>
                    <InquiryTitle>{inquiry.title}</InquiryTitle>
                    <InquiryStatus>{inquiry.status}</InquiryStatus>
                  </InquiryInfo>
                  <InquiryDate>{new Date(inquiry.createdAt).toLocaleDateString()}</InquiryDate>
                </InquiryItem>
              ))}
            </InquiryList>
          </CardContent>
        </Card>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  flex: 1;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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

const CardTitle = styled.h2`
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

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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

const ProjectStats = styled.div`
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

const StatLabel = styled.span`
  color: #64748b;
  white-space: nowrap;
`;

const StatValue = styled.span`
  color: #1e293b;
  font-weight: 500;
  white-space: nowrap;
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProjectItem = styled.div`
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

const ProjectName = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const ProjectStatus = styled.span`
  color: ${props => props.status === '진행중' ? '#2E7D32' : '#FFA000'};
  font-weight: 500;
`;

const ProjectDate = styled.span`
  color: #64748b;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PostItem = styled.div`
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

const PostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PostTitle = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const PostAuthor = styled.span`
  color: #64748b;
`;

const PostDate = styled.span`
  color: #64748b;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InquiryItem = styled.div`
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

const InquiryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InquiryTitle = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const InquiryStatus = styled.span`
  color: ${props => props.status === '답변완료' ? '#2E7D32' : '#FFA000'};
  font-weight: 500;
`;

const InquiryDate = styled.span`
  color: #64748b;
`;

const ApprovalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ApprovalItem = styled.div`
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

const ApprovalInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ApprovalTitle = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const ApprovalStatus = styled.span`
  color: ${props => props.status === '승인됨' ? '#2E7D32' : '#FFA000'};
  font-weight: 500;
`;

const ApprovalDate = styled.span`
  color: #64748b;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  font-size: 16px;
  color: #64748b;
`;

const RecentApprovalsCard = styled(Card)``;

const RecentPostsCard = styled(Card)``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 16px;
`;

export default Dashboard;