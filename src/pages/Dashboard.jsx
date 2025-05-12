import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
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
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [deadlineProjects, setDeadlineProjects] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);

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

  useEffect(() => {
    fetchRecentPosts();
    fetchRecentInquiries();
    fetchRecentProposals();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      console.log('최근 게시물 요청 URL:', API_ENDPOINTS.POST.RECENT);
      const { data } = await axiosInstance.get(API_ENDPOINTS.POST.RECENT);
      console.log('최근 게시물 응답:', data);
      if (Array.isArray(data)) {
        setRecentPosts(data);
      } else {
        console.error('최근 게시물 응답이 배열이 아닙니다:', data);
        setRecentPosts([]);
      }
    } catch (error) {
      console.error('최근 게시글 조회 실패:', error);
      if (error.response?.status === 403) {
        console.log('권한이 없습니다. 로그인이 필요합니다.');
      }
      setRecentPosts([]);
    }
  };

  const fetchRecentInquiries = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.USER_INQUIRY_LIST, {
        withCredentials: true
      });
      setRecentInquiries(data);
    } catch (error) {
      console.error('최근 문의사항 조회 실패:', error);
      if (error.response?.status === 403) {
        console.log('권한이 없습니다. 로그인이 필요합니다.');
      }
      setRecentInquiries([]);
    }
  };

  const fetchRecentProposals = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.RECENT, {
        withCredentials: true
      });
      setRecentProposals(data.approvalList || []);
    } catch (error) {
      console.error('최근 승인요청 조회 실패:', error);
      if (error.response?.status === 403) {
        console.log('권한이 없습니다. 로그인이 필요합니다.');
      }
      setRecentProposals([]);
    }
  };

  // 마감 임박 프로젝트 불러오기
  useEffect(() => {
    if (user?.id) {
      fetchUserProjects(user.id);
    }
  }, [user]);

  const fetchUserProjects = async (userId) => {
    try {
      const { data } = await axiosInstance.get('/projects', { params: { userId } });
      if (Array.isArray(data)) {
        // "deleted": false && "projectStatus" !== "COMPLETED" 인 것만 필터
        const filtered = data.filter(
          (project) => !project.deleted && project.projectStatus !== 'COMPLETED'
        );
        // endDate 오름차순 정렬
        const sorted = [...filtered].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        setDeadlineProjects(sorted);
      } else {
        setDeadlineProjects([]);
      }
    } catch (e) {
      setDeadlineProjects([]);
    }
  };

  const getProjectStatusText = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '진행중';
      case 'SUSPENDED':
        return '중단';
      case 'COMPLETED':
        return '종료';
      default:
        return status;
    }
  };

  const getApprovalStatusText = (status) => {
    switch (status) {
      case 'FINAL_APPROVED':
        return '승인됨';
      case 'FINAL_REJECTED':
        return '거절됨';
      case 'UNDER_REVIEW':
        return '대기중';
      case 'DRAFT':
        return '요청전';
      default:
        return status;
    }
  };

  // D-Day 계산 함수 추가
  const getDDay = (endDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const end = new Date(endDate);
    end.setHours(0,0,0,0);
    const diff = Math.floor((end - today) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `D-${diff}`;
    if (diff === 0) return 'D-0';
    return `D+${Math.abs(diff)}`;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <MainContent>
          <CardGrid>
            <Card>
              <CardTitle>마감 임박 프로젝트</CardTitle>
              <CardContent>
                {deadlineProjects.length > 0 ? (
                  deadlineProjects.map((project) => (
                    <ProjectItem key={project.projectId} onClick={() => navigate(`/project/${project.projectId}`)}>
                      <ProjectInfo>
                        <ProjectName>{project.name}</ProjectName>
                        <ProjectDate>
                          마감일: {new Date(project.endDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }).replace(/\. /g, '.').slice(0, -1)}
                        </ProjectDate>
                      </ProjectInfo>
                      <DDay overdue={getDDay(project.endDate).startsWith('D+')}>{getDDay(project.endDate)}</DDay>
                    </ProjectItem>
                  ))
                ) : (
                  <EmptyMessage>마감 임박 프로젝트가 없습니다.</EmptyMessage>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardTitle>관리자 문의내역</CardTitle>
              <CardContent>
                {recentInquiries.length > 0 ? (
                  recentInquiries.map(inquiry => (
                    <ProjectItem 
                      key={inquiry.id} 
                      onClick={() => navigate(`/admin/inquiry/${inquiry.id}`)}
                    >
                      <ProjectInfo>
                        <ProjectName>{inquiry.title}</ProjectName>
                        <ProjectDate>
                          {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).replace(/\. /g, '.').slice(0, -1)}
                        </ProjectDate>
                      </ProjectInfo>
                      <ProjectStatus status={inquiry.status}>
                        {inquiry.status === 'COMPLETED' ? '답변완료' : '답변대기'}
                      </ProjectStatus>
                    </ProjectItem>
                  ))
                ) : (
                  <EmptyMessage>관리자 문의내역이 없습니다.</EmptyMessage>
                )}
              </CardContent>
            </Card>
          </CardGrid>

          <CardGrid>
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
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
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
                {recentProposals.length > 0 ? (
                  recentProposals.map((proposal) => (
                    <ProjectItem key={proposal.id} onClick={() => navigate(`/approval/${proposal.id}`)}>
                      <ProjectInfo>
                        <ProjectName>{proposal.title}</ProjectName>
                        <ProjectDate>
                          {new Date(proposal.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).replace(/\. /g, '.').slice(0, -1)}
                        </ProjectDate>
                      </ProjectInfo>
                      <ProjectStatus status={proposal.approvalProposalStatus}>
                        {getApprovalStatusText(proposal.approvalProposalStatus)}
                      </ProjectStatus>
                    </ProjectItem>
                  ))
                ) : (
                  <EmptyMessage>최근 승인요청이 없습니다.</EmptyMessage>
                )}
              </CardContent>
            </Card>
          </CardGrid>
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
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
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
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
  gap: 0;
  min-height: 0;
  flex: 1;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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

const ProjectDate = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ProjectStatus = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.status === 'IN_PROGRESS' ? '#2E7D32' : props.status === 'SUSPENDED' ? '#E53E3E' : '#4B5563'};
`;

const EmptyMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  text-align: center;
  padding: 24px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// DDay 스타일 현대적으로 개선
const DDay = styled.span`
  min-width: 56px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: ${props =>
    props.overdue
      ? 'linear-gradient(90deg, #ff5858 0%, #f857a6 100%)'
      : 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'};
  border-radius: 999px;
  padding: 5px 18px;
  margin-left: 28px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  letter-spacing: 1px;
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 24px rgba(0,0,0,0.13);
  }
`;

export default Dashboard;