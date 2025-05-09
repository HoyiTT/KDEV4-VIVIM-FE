import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import axiosInstance from '../utils/axiosInstance';
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
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 읽지 않은 알림 수 계산
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadNotifications(count);
  }, [notifications]);

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

  return (
    <PageContainer>
      <ContentWrapper>
        <Card>
          <CardTitle>최근 게시글</CardTitle>
          <CardContent>
            <PostList>
              {recentPosts.map(post => (
                <PostItem key={post.id}>
                  <PostTitle>{post.title}</PostTitle>
                  <PostInfo>
                    <PostAuthor>{post.author}</PostAuthor>
                    <PostDate>{formatDate(post.createdAt)}</PostDate>
                  </PostInfo>
                </PostItem>
              ))}
            </PostList>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>최근 문의사항</CardTitle>
          <CardContent>
            <InquiryList>
              {recentInquiries.map(inquiry => (
                <InquiryItem key={inquiry.id}>
                  <InquiryTitle>{inquiry.title}</InquiryTitle>
                  <InquiryInfo>
                    <InquiryStatus status={inquiry.status}>
                      {inquiry.status}
                    </InquiryStatus>
                    <InquiryDate>{formatDate(inquiry.createdAt)}</InquiryDate>
                  </InquiryInfo>
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