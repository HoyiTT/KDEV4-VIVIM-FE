import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import { getApprovalStatusText } from '../utils/approvalStatus';
import { ApprovalProposalStatus } from '../constants/enums';
import { FaCheck, FaClock, FaEdit, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, userId: currentUserId, user } = useAuth();
  const [deadlineProjects, setDeadlineProjects] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');
  const [recentApprovals, setRecentApprovals] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const handleMenuClick = (menuItem) => setActiveMenuItem(menuItem);

  const handleDeleteApproval = async (approvalId) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.APPROVAL.DELETE(approvalId));
      alert('승인요청이 성공적으로 삭제되었습니다.');
      fetchRecentApprovals();
    } catch {
      alert('승인요청 삭제에 실패했습니다.');
    }
  };

  const handleDeleteProgress = async (projectId) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      alert('프로젝트 진행단계가 성공적으로 삭제되었습니다.');
      fetchProjects();
    } catch {
      alert('프로젝트 진행단계 삭제에 실패했습니다.');
    }
  };

  const calculateDeadline = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    const now = Date.now();
    const diff = now - new Date(dateString);
    const day = 24 * 60 * 60 * 1000;
    if (diff >= day) return `${Math.floor(diff / day)}일 전`;
    if (diff >= 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}시간 전`;
    if (diff >= 60 * 1000) return `${Math.floor(diff / (60 * 1000))}분 전`;
    return '방금 전';
  };

  const fetchRecentApprovals = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.RECENT, {
        withCredentials: true
      });
      setRecentApprovals(data.approvalList || []);
    } catch (error) {
      console.error('Error fetching recent approvals:', error);
      if (error.response?.status === 403) {
        console.log('승인 목록 조회 권한이 없습니다.');
      }
      setRecentApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.POST.RECENT, {
        withCredentials: true
      });
      console.log('게시글 목록 응답:', data);
      setRecentPosts(data || []);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      if (error.response?.status === 403) {
        console.log('게시글 목록 조회 권한이 없습니다.');
      }
      setRecentPosts([]);
    }
  };

  const fetchProjects = async () => {
    if (!user?.id) return;
    
    try {
      const { data: projects } = await axiosInstance.get(
        `${API_ENDPOINTS.PROJECTS}?userId=${user.id}`,
        {
          withCredentials: true
        }
      );
      const processed = projects
        .filter(p => !p.deleted)
        .map(p => ({
          ...p,
          remainingDays: calculateDeadline(p.endDate)
        }))
        .sort((a, b) => Math.abs(a.remainingDays) - Math.abs(b.remainingDays));
      setDeadlineProjects(processed);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setDeadlineProjects([]);
    }
  };

  useEffect(() => {
    fetchRecentApprovals();
    fetchRecentPosts();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await axiosInstance.get(API_ENDPOINTS.USER_INFO, {
          withCredentials: true
        });
        setUserInfo(data.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <Container>
      <Navbar activeMenuItem={activeMenuItem} handleMenuClick={handleMenuClick} />
      <MainContent>
        {userInfo && (
          <UserInfoSection>
            <Card>
              <Header>
                <Avatar>{userInfo.name[0]}</Avatar>
                <UserInfo>
                  <Name>{userInfo.name}</Name>
                  <Company>{userInfo.companyName}</Company>
                </UserInfo>
              </Header>
              <Details>
                <Detail>
                  <Label>이메일</Label>
                  <Value>{userInfo.email}</Value>
                </Detail>
                <Detail>
                  <Label>연락처</Label>
                  <Value>{userInfo.phone}</Value>
                </Detail>
                <Detail>
                  <Label>직책</Label>
                  <Value>{userInfo.companyRole === 'ADMIN' ? '관리자' : '사용자'}</Value>
                </Detail>
              </Details>
            </Card>
          </UserInfoSection>
        )}

        <SectionArea>
          <Section flex="0.7">
            <Title>마감 임박 프로젝트</Title>
            <Table>
              <thead>
                <tr>
                  <Th>프로젝트</Th><Th>남은일</Th><Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {deadlineProjects.map(p => (
                  <tr key={p.projectId} onClick={() => navigate(`/project/${p.projectId}`)}>
                    <Td>{p.name}</Td>
                    <Td>
                      <Badge type={p.remainingDays < 0 ? 'delayed' : 'normal'}>
                        {`D${p.remainingDays < 0 ? '+' : '-'}${Math.abs(p.remainingDays)}`}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge type={p.remainingDays < 0 ? 'delayed' : 'normal'}>
                        {p.remainingDays < 0 ? '지연' : '정상'}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section flex="1.3">
            <Title>최근 승인요청</Title>
            <Table>
              <thead>
                <tr>
                  <Th>작성자</Th><Th>단계</Th><Th>제목</Th><Th>작성일</Th><Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><Td colSpan="5">로딩 중...</Td></tr>
                ) : recentApprovals.length === 0 ? (
                  <tr><Td colSpan="5">없음</Td></tr>
                ) : (
                  recentApprovals.map(a => (
                    <tr key={a.id} onClick={() => navigate(`/approval/${a.id}`)}>
                      <Td>
                        <Creator>
                          <div>{a.creator.name}</div>
                          <Small>{a.creator.companyName}</Small>
                        </Creator>
                      </Td>
                      <Td>{a.progress.name}</Td>
                      <Td>{a.title}</Td>
                      <Td>{formatDate(a.createdAt)}</Td>
                      <Td>
                        <Badge type={a.approvalProposalStatus}>
                          {getApprovalStatusText(a.approvalProposalStatus)}
                        </Badge>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Section>
        </SectionArea>

        <Section>
          <Title>게시판 최근글</Title>
          <Table>
            <thead>
              <tr>
                <Th>분류</Th><Th>제목</Th><Th>글쓴이</Th><Th>날짜</Th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post.postId} onClick={() => navigate(`/project/${post.projectId}/post/${post.postId}`)}>
                  <Td><PostType type={post.projectPostStatus}>{post.projectPostStatus === 'NOTIFICATION' ? '공지' : '일반'}</PostType></Td>
                  <Td>{post.title}</Td>
                  <Td>{post.creatorName}</Td>
                  <Td>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </MainContent>
    </Container>
  );
};

const Container = styled.div`display:flex;flex-direction:column;min-height:100vh;background:#f5f7fa;`;
const MainContent = styled.main`padding:24px;margin-top:60px;max-width:1300px;width:calc(100%-100px);margin-left:auto;margin-right:auto;`;
const SectionArea = styled.div`display:flex;gap:24px;margin-bottom:24px;`;
const Section = styled.section`background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);flex:${props=>props.flex||'none'};`;
const Title = styled.h2`font-size:19px;font-weight:600;color:#1e293b;margin-bottom:20px;`;
const Table = styled.table`width:100%;border-collapse:separate;border-spacing:0;`;
const Th = styled.th`text-align:left;padding:12px;font-size:14px;font-weight:500;color:#64748b;border-bottom:1px solid #e2e8f0;`;
const Td = styled.td`padding:12px;font-size:14px;color:#1e293b;border-bottom:1px solid #e2e8f0;cursor:pointer;`;
const Badge = styled.span`display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;background:${props=>props.type==='delayed'?'rgba(239,68,68,0.1)':'rgba(46,125,50,0.1)'};color:${props=>props.type==='delayed'?'#EF4444':'#2E7D32'};`;
const UserInfoSection = styled.div`margin-bottom:24px;`;
const Card = styled.div`background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);`;
const Header = styled.div`display:flex;align-items:center;gap:16px;margin-bottom:24px;`;
const Avatar = styled.div`width:64px;height:64px;border-radius:50%;background:#2E7D32;color:white;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;`;
const UserInfo = styled.div`display:flex;flex-direction:column;gap:4px;`;
const Name = styled.h2`font-size:20px;font-weight:600;color:#1e293b;margin:0;`;
const Company = styled.p`font-size:14px;color:#64748b;margin:0;`;
const Details = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;`;
const Detail = styled.div`display:flex;flex-direction:column;gap:4px;`;
const Label = styled.span`font-size:12px;color:#64748b;`;
const Value = styled.span`font-size:14px;color:#1e293b;font-weight:500;`;
const Creator = styled.div`display:flex;flex-direction:column;gap:4px;`;
const Small = styled.span`font-size:11px;color:#64748b;`;
const PostType = styled.span`display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:500;background:${props=>props.type==='NOTIFICATION'?'rgba(46,125,50,0.1)':'rgba(59,130,246,0.1)'};color:${props=>props.type==='NOTIFICATION'?'#2E7D32':'#3B82F6'};`;

export default Dashboard;