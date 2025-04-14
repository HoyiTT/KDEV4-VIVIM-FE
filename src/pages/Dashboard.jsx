import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [deadlineProjects, setDeadlineProjects] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');

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

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const calculateDeadline = (endDate) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

      const response = await fetch(`https://dev.vivim.co.kr/api/projects?userId=${userId}`, {
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

  const approvalRequests = [
    {
      projectName: '스마트 팩토리 구축 프로젝트',
      requestType: 'User API 개발',
      requestDate: '2025/04/14',
      status: '승인',
    },
    {
      projectName: '스마트 팩토리 구축 프로젝트',
      requestType: 'User API 개발',
      requestDate: '2025/04/14',
      status: '다처리',
    },
  ];

  const recentPosts = [
    {
      type: '공지',
      title: '3월 정기 업데이트 안내',
      projectName: '스마트 팩토리 구축 프로젝트',
      status: '최상위급',
      author: '관리자',
      date: '2024.02.29',
    },
    {
      type: '질문',
      title: 'API 연동 관련 문의',
      projectName: '스마트 팩토리 구축 프로젝트',
      status: '다처리',
      author: '이지은',
      date: '2024.02.28',
    },
    {
      type: '질문',
      title: 'API 연동 관련 문의',
      projectName: '스마트 팩토리 구축 프로젝트',
      status: '다처리',
      author: '이지은',
      date: '2024.02.28',
    },
  ];

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <TopSection>
          <Section flex={1}>
            <SectionTitle>승인 요청 안내</SectionTitle>
            <Table>
              <thead>
                <tr>
                  <Th>프로젝트 명</Th>
                  <Th>요청 내역</Th>
                  <Th>요청 일자</Th>
                  <Th>진행 단계</Th>
                </tr>
              </thead>
              <tbody>
                {approvalRequests.map((request, index) => (
                  <tr key={index}>
                    <Td>{request.projectName}</Td>
                    <Td>{request.requestType}</Td>
                    <Td>{request.requestDate}</Td>
                    <Td>
                      <StatusBadge status={request.status}>
                        {request.status}
                      </StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section flex={1}>
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
                  <tr key={project.projectId}>
                    <Td onClick={() => navigate(`/project/${project.projectId}`)} style={{ cursor: 'pointer' }}>
                      {project.name}
                    </Td>
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
        </TopSection>

        <Section>
          <SectionTitle>게시판 최근글</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>분류</Th>
                <Th>제목</Th>
                <Th>프로젝트 명</Th>
                <Th>진행 단계</Th>
                <Th>글쓴이</Th>
                <Th>작성일</Th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post, index) => (
                <tr key={index}>
                  <Td>
                    <PostType type={post.type}>{post.type}</PostType>
                  </Td>
                  <Td>{post.title}</Td>
                  <Td>{post.projectName}</Td>
                  <Td>
                    <StatusBadge status={post.status}>
                      {post.status}
                    </StatusBadge>
                  </Td>
                  <Td>{post.author}</Td>
                  <Td>{post.date}</Td>
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
  margin-top: 60px;
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
  font-size: 18px;
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
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'delayed':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        `;
      default:
        return `
          background: rgba(46, 125, 50, 0.1);
          color: #2E7D32;
        `;
    }
  }}
`;

const DeadlineBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.status === 'delayed' ? `
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  ` : `
    background: rgba(46, 125, 50, 0.1);
    color: #2E7D32;
  `}
`;

const PostType = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.type) {
      case '공지':
        return `
          background: rgba(46, 125, 50, 0.1);
          color: #2E7D32;
        `;
      case '질문':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        `;
      default:
        return `
          background: rgba(46, 125, 50, 0.1);
          color: #2E7D32;
        `;
    }
  }}
`;

export default Dashboard;