import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import ChecklistComponent from '../components/ChecklistComponent';
import ProjectPostCreate from './ProjectPostCreate';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add new state for progress list
  const [progressList, setProgressList] = useState([]);

  useEffect(() => {
    fetchProjectDetail();
    fetchProjectPosts();
    fetchProjectProgress(); // Add new fetch call
  }, [id]);

  // Add new fetch function for progress
  const fetchProjectProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.PROJECT_DETAIL(id)}/progress`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setProgressList(data.progressList);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchProjectDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PROJECT_DETAIL(id), {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setProject(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  const fetchProjectPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_ENDPOINTS.PROJECT_DETAIL(id)}/posts`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <Header>
          <PageTitle>프로젝트 상세</PageTitle>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : project ? (
          <ContentContainer>
            <ProjectInfoSection>
              <ProjectHeader>
                <ProjectTitle>{project.name}</ProjectTitle>
                <StatusBadge deleted={project.deleted}>
                  {project.deleted ? '삭제됨' : '진행중'}
                </StatusBadge>
              </ProjectHeader>
              <ProjectDescription>{project.description || '프로젝트 설명이 없습니다.'}</ProjectDescription>
              <DateContainer>
                <DateItem>
                  <DateLabel>시작일</DateLabel>
                  <DateValue>{project.startDate}</DateValue>
                </DateItem>
                <DateItem>
                  <DateLabel>종료일</DateLabel>
                  <DateValue>{project.endDate}</DateValue>
                </DateItem>
              </DateContainer>
            </ProjectInfoSection>

            <StageSection>
              <SectionTitle>진행 단계</SectionTitle>
              <StageGrid>
                {progressList
                  .sort((a, b) => a.position - b.position)
                  .map((stage) => (
                    <StageItem key={stage.id}>
                      <StageHeader>{stage.name}</StageHeader>
                      <ChecklistComponent progressId={stage.id} />
                    </StageItem>
                  ))}
              </StageGrid>
            </StageSection>
            
                        <BoardSection>
                          <BoardHeader>
                            <SectionTitle>게시판</SectionTitle>
                            <CreateButton onClick={() => navigate(`/project/${id}/post/create`)}>
                              글쓰기
                            </CreateButton>
                          </BoardHeader>
                          <BoardTable>
                            <thead>
                              <tr>
                                <BoardHeaderCell>제목</BoardHeaderCell>
                                <BoardHeaderCell>상태</BoardHeaderCell>
                                <BoardHeaderCell>작성자</BoardHeaderCell>
                                <BoardHeaderCell>역할</BoardHeaderCell>
                                <BoardHeaderCell>작성일</BoardHeaderCell>
                                <BoardHeaderCell>수정일</BoardHeaderCell>
                                <BoardHeaderCell></BoardHeaderCell>
                              </tr>
                            </thead>
                            <tbody>
                              {posts
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .reduce((acc, post) => {
                                  if (!post.parentId) {
                                    acc.push(post);
                                    const replies = posts.filter(reply => reply.parentId === post.postId);
                                    acc.push(...replies);
                                  }
                                  return acc;
                                }, [])
                                .map((post) => (
                                  <BoardRow key={post.postId}>
                                    <BoardCell 
                                      className={`title-cell ${post.parentId ? 'child-post' : ''}`}
                                      onClick={() => navigate(`/project/${id}/post/${post.postId}`)}
                                    >
                                      {post.parentId && <ReplyIndicator>↳</ReplyIndicator>}
                                      {post.title}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.projectPostStatus === 'NOTIFICATION' ? '공지' : 
                                       post.projectPostStatus === 'QUESTION' ? '질문' : '일반'}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.creatorName}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.creatorRole}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.modifiedAt ? new Date(post.modifiedAt).toLocaleDateString() : '-'}
                                    </BoardCell>
                                    <ActionCell className={post.parentId ? 'child-post' : ''}>
                                      <ReplyButton onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/project/${id}/post/create`, {
                                          state: { parentPost: post }
                                        });
                                      }}>
                                        답글
                                      </ReplyButton>
                                    </ActionCell>
                                  </BoardRow>
                                ))}
                            </tbody>
                          </BoardTable>
                        </BoardSection>
          </ContentContainer>
        ) : (
          <ErrorMessage>프로젝트를 찾을 수 없습니다.</ErrorMessage>
        )}
      </MainContent>
    </PageContainer>
  );
};

// DashboardContainer를 PageContainer로 변경하고 flex-direction을 column으로 설정
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

// MainContent 스타일 수정 (중복 선언 제거)
const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px; // 네비게이션바 높이만큼 여백 추가
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProjectInfoSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const InfoValue = styled.span`
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.deleted ? `
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  ` : `
    background: rgba(46, 125, 50, 0.1);
    color: #2E7D32;
  `}
`;




const ReplyButton = styled.button`
  padding: 4px 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

// Then, replace the BoardSection content with:

const StageSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const StageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// Update the StageItem styled component
const StageItem = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 200px;
`;

const StageHeader = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StageCount = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #2E7D32;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #ef4444;
`;

const BoardSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
  }
`;

const BoardTable = styled.table`
  width: 100%;
  border-collapse: collapse;  // separate를 collapse로 변경
  border-spacing: 0;
`;

const BoardCell = styled.td`
  padding: 8px 12px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  min-height: 30px;
  white-space: normal;
  word-break: break-word;
  background: transparent;
  vertical-align: middle; /* 수직 정렬 추가 */
  line-height: 1.5; /* 줄 높이 추가 */

  &.title-cell {
    display: table-cell; /* flex에서 table-cell로 변경 */
    align-items: center;
    max-width: 400px;
  }

  &.child-post {
    padding-left: 40px;
  }
`;

const BoardHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const BoardRow = styled.tr`
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

// Add this new styled component
const ReplyIndicator = styled.span`
  color: #64748b;
  margin-right: 8px;
  font-size: 14px;
`;



const InfoItemFull = styled(InfoItem)`
  grid-column: 1 / -1;
`;

export default ProjectDetail;


const ProjectTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const ProjectDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const DateContainer = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateLabel = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const DateValue = styled.span`
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
`;

const StatusContainer = styled.div`
  margin-top: 8px;
`;
const ActionCell = styled(BoardCell)`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-right: 24px;
  min-width: 100px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
`;