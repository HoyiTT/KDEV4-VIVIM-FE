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
  const [showDropdown, setShowDropdown] = useState(false); // Add this line
  const handleDeleteProject = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.PROJECTS}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token,
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (response.ok) {
          alert('프로젝트가 삭제되었습니다.');
          navigate('/dashboard');
        } else {
          alert('프로젝트 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('프로젝트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // Add new state for progress list
  const [progressList, setProgressList] = useState([]);

  useEffect(() => {
    fetchProjectDetail();
    fetchProjectPosts();
    fetchProjectProgress(); // Add new fetch call
  }, [id]);

  const translateRole = (role) => {
    switch (role) {
      case 'DEVELOPER':
        return '개발사';
      case 'CLIENT':
        return '의뢰인';
      case 'ADMIN':
        return '관리자';
      default:
        return '일반';
    }
  };
  
    // Add this near the other styled components
  const getRoleColor = (role) => {
    switch (role) {
      case 'DEVELOPER':
        return {
          background: '#dbeafe',
          border: '#93c5fd',
          text: '#2563eb'
        };
      case 'CLIENT':
        return {
          background: '#fef9c3',
          border: '#fde047',
          text: '#ca8a04'
        };
      case 'ADMIN':
        return {
          background: '#fee2e2',
          border: '#fca5a5',
          text: '#dc2626'
        };
      default:
        return {
          background: '#f1f5f9',
          border: '#e2e8f0',
          text: '#64748b'
        };
    }
  };
  const RoleTag = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => getRoleColor(props.role).background};
  border: 1px solid ${props => getRoleColor(props.role).border};
  color: ${props => getRoleColor(props.role).text};
  display: inline-block;
  line-height: 1.4;
`;
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

  // Add adminCheckLoading state
    const [adminCheckLoading, setAdminCheckLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(null);
  
    useEffect(() => {
      const checkAdminStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const isAdminUser = decodedToken.role === 'ADMIN';
            setIsAdmin(isAdminUser);
          } catch (error) {
            console.error('Error decoding token:', error);
            setIsAdmin(false);
          }
        }
        setAdminCheckLoading(false);
      };
      
      checkAdminStatus();
    }, []);
  
  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <ContentWrapper>
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
                <StatusContainer>
                  <StatusBadge isDeleted={project.isDeleted}>
                    {project.isDeleted ? '삭제됨' : '진행중'}
                  </StatusBadge>
                  {isAdmin && (
                    <DropdownContainer>
                      <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
                        ⋮
                      </DropdownButton>
                      {showDropdown && (
                        <DropdownMenu>
                          <DropdownItem onClick={() => navigate(`/projectModify/${id}`)}>
                            수정하기
                          </DropdownItem>
                          <DropdownItem onClick={() => handleDeleteProject()} className="delete">
                            삭제하기
                          </DropdownItem>
                        </DropdownMenu>
                      )}
                    </DropdownContainer>
                  )}
                </StatusContainer>
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
                                <BoardHeaderCell>답글</BoardHeaderCell>
                                <BoardHeaderCell>상태</BoardHeaderCell>
                                <BoardHeaderCell>작성자</BoardHeaderCell>
                                <BoardHeaderCell>역할</BoardHeaderCell>
                                <BoardHeaderCell>작성일</BoardHeaderCell>
                                <BoardHeaderCell>수정일</BoardHeaderCell>
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
                                    <BoardCell>
                                      {!post.parentId && (
                                        <ReplyButton onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/project/${id}/post/create`, {
                                            state: { parentPost: post }
                                          });
                                        }}>
                                          답글
                                        </ReplyButton>
                                      )}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.projectPostStatus === 'NOTIFICATION' ? '공지' : 
                                       post.projectPostStatus === 'QUESTION' ? '질문' : '일반'}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.creatorName}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      <RoleTag role={post.creatorRole}>{translateRole(post.creatorRole)}</RoleTag>
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
                                    </BoardCell>
                                    <BoardCell onClick={() => navigate(`/project/${id}/post/${post.postId}`)}>
                                      {post.modifiedAt ? new Date(post.modifiedAt).toLocaleDateString() : '-'}
                                    </BoardCell>
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
    </ContentWrapper>
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

// MainContent 스타일 수정 (중복 선언 제거)
const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  
  ${props => props.isDeleted ? `
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
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  
  /* Add styling for the scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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
  min-width: 200px;
  flex: 0 0 auto;
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

const ActionCell = styled(BoardCell)`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-right: 24px;
  min-width: 100px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
`;
const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

// Add these styled components at the bottom of the file
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 8px;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background: #f1f5f9;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  &.delete {
    color: #dc2626;
    
    &:hover {
      background: #fee2e2;
    }
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;



