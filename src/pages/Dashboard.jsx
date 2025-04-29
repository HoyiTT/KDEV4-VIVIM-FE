import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getApprovalStatusText } from '../utils/approvalStatus';
import { ApprovalProposalStatus } from '../constants/enums';
import { FaCheck, FaClock, FaEdit, FaTimes } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [deadlineProjects, setDeadlineProjects] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentApprovals, setRecentApprovals] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const isAdmin = decodedToken?.role === 'ADMIN';
  const currentUserId = decodedToken?.userId;

  // 디버깅을 위한 로그 추가
  console.log('User Role:', decodedToken?.role);
  console.log('Is Admin:', isAdmin);
  console.log('Current User ID:', currentUserId);

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const canEditApproval = (approval) => {
    return isAdmin || (currentUserId && approval.creator.id === currentUserId);
  };

  const handleDeleteApproval = async (approvalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.DELETE(approvalId), {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('승인요청 삭제에 실패했습니다.');
      }

      alert('승인요청이 성공적으로 삭제되었습니다.');
      fetchRecentApprovals(); // 목록 새로고침
    } catch (error) {
      console.error('Error deleting approval:', error);
      alert('승인요청 삭제에 실패했습니다.');
    }
  };

  const canEditProgress = (project) => {
    // 디버깅을 위한 로그 추가
    console.log('Project Creator ID:', project.creatorId);
    console.log('Can Edit:', isAdmin || (currentUserId && project.creatorId === currentUserId));
    
    return isAdmin || (currentUserId && project.creatorId === currentUserId);
  };

  const handleDeleteProgress = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('프로젝트 진행단계 삭제에 실패했습니다.');
      }

      alert('프로젝트 진행단계가 성공적으로 삭제되었습니다.');
      fetchProjects(); // 목록 새로고침
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('프로젝트 진행단계 삭제에 실패했습니다.');
    }
  };

  const calculateDeadline = (endDate) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchRecentApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.RECENT, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('최근 승인요청 목록 조회에 실패했습니다.');
      }

      const data = await response.json();
      setRecentApprovals(data.approvalList || []);
    } catch (error) {
      console.error('Error fetching recent approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentApprovals();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 ${diffMinutes % 60}분 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = decodeToken(token);
      const userId = decodedToken?.userId;

      if (!userId) {
        console.error('User ID not found in token');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const projects = await response.json();
      
      const processedProjects = projects
        .filter(project => !project.deleted)
        .map(project => ({
          ...project,
          remainingDays: calculateDeadline(project.endDate),
          isOverdue: calculateDeadline(project.endDate) < 0
        }))
        .sort((a, b) => Math.abs(a.remainingDays) - Math.abs(b.remainingDays));

      setDeadlineProjects(processedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/user/recent`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch recent posts');
        const data = await response.json();
        setRecentPosts(data);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setRecentPosts([]);
      }
    };

    fetchRecentPosts();
  }, []);

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <TopSection>
          <Section flex={0.7}>
            <SectionTitle>마감 임박 프로젝트</SectionTitle>
            <DeadlineTable>
              <thead>
                <tr>
                  <Th>프로젝트 명</Th>
                  <Th>마감 일자</Th>
                  <Th>단계</Th>
                </tr>
              </thead>
              <tbody>
                {deadlineProjects.map((project) => (
                  <tr 
                    key={project.projectId}
                    onClick={() => navigate(`/project/${project.projectId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Td>{project.name}</Td>
                    <Td>
                      <DeadlineBadge status={project.remainingDays < 0 ? 'delayed' : 'normal'}>
                        D{project.remainingDays < 0 ? '+' : '-'}{Math.abs(project.remainingDays)}
                      </DeadlineBadge>
                    </Td>
                    <Td>
                      <StatusBadge status={project.remainingDays < 0 ? 'delayed' : 'normal'}>
                        {project.remainingDays < 0 ? '지연' : '정상'}
                      </StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </DeadlineTable>
          </Section>

          <Section flex={1.3}>
            <SectionTitle>최근 승인요청 안내</SectionTitle>
            <Table>
              <thead>
                <tr>
                  <Th>작성자</Th>
                  <Th>진행단계</Th>
                  <Th>제목</Th>
                  <Th>작성일</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : recentApprovals.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      최근 승인요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  recentApprovals.map((approval) => (
                    <tr 
                      key={approval.id} 
                      onClick={() => navigate(`/approval/${approval.id}`)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <Td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span>{approval.creator.name}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{approval.creator.companyName}</span>
                        </div>
                      </Td>
                      <Td>{approval.progress.name}</Td>
                      <Td>
                        {approval.title}
                      </Td>
                      <Td>{formatDate(approval.createdAt)}</Td>
                      <Td>
                        <StatusBadge status={approval.approvalProposalStatus}>
                          {getApprovalStatusText(approval.approvalProposalStatus)}
                        </StatusBadge>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Section>
        </TopSection>

        <Section>
          <SectionTitle>게시판 최근글</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>분류</Th>
                <Th>제목</Th>
                <Th>글쓴이</Th>
                <Th>작성일</Th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.postId}>
                  <Td>
                    <PostType type={post.projectPostStatus}>
                      {post.projectPostStatus === 'NOTIFICATION' ? '공지' : '일반'}
                    </PostType>
                  </Td>
                  <Td onClick={() => navigate(`/project/${post.projectId}/post/${post.postId}`)} style={{ cursor: 'pointer' }}>
                    {post.title}
                  </Td>
                  <Td>{post.creatorName}</Td>
                  <Td>
                    {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\. /g, '.').slice(0, -1)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </MainContent>
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
  gap: 24px;
  margin-bottom: 24px;
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: ${props => props.flex || 'none'};
`;

const SectionTitle = styled.h2`
  font-size: 19px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const DeadlineTable = styled(Table)`
  th, td {
    padding: 12px 16px;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;

  &:hover {
    ${props => props.onClick && `
      color: #2E7D32;
      text-decoration: underline;
    `}
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background-color: ${props => {
    switch (props.status) {
      case ApprovalProposalStatus.DRAFT:
        return 'rgba(75, 85, 99, 0.08)';
      case ApprovalProposalStatus.UNDER_REVIEW:
        return 'rgba(30, 64, 175, 0.08)';
      case ApprovalProposalStatus.FINAL_APPROVED:
        return 'rgba(4, 120, 87, 0.08)';
      case ApprovalProposalStatus.FINAL_REJECTED:
        return 'rgba(185, 28, 28, 0.08)';
      case 'delayed':
        return 'rgba(239, 68, 68, 0.08)';
      case 'normal':
        return 'rgba(46, 125, 50, 0.08)';
      default:
        return 'rgba(75, 85, 99, 0.08)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case ApprovalProposalStatus.DRAFT:
        return '#4B5563';
      case ApprovalProposalStatus.UNDER_REVIEW:
        return '#1E40AF';
      case ApprovalProposalStatus.FINAL_APPROVED:
        return '#047857';
      case ApprovalProposalStatus.FINAL_REJECTED:
        return '#B91C1C';
      case 'delayed':
        return '#EF4444';
      case 'normal':
        return '#2E7D32';
      default:
        return '#4B5563';
    }
  }};
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 14px;
    opacity: 0.9;
  }
`;

const PostType = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.type === 'NOTIFICATION' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  color: ${props => props.type === 'NOTIFICATION' ? '#2E7D32' : '#3B82F6'};
`;

const DeadlineBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'delayed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(46, 125, 50, 0.1)'};
  color: ${props => props.status === 'delayed' ? '#EF4444' : '#2E7D32'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 11px;
  color: #3B82F6;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

export default Dashboard;