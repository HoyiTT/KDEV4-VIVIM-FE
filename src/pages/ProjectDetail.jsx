import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
// Sidebar 대신 Navbar 컴포넌트를 사용하도록 변경
import Navbar from '../components/Navbar';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetail();
    fetchProjectPosts();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/projects/${id}`);
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
      const response = await fetch(`http://localhost:8080/api/projects/${id}/posts`);
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
                <StageItem>
                  <StageHeader>기획</StageHeader>
                  <StageCount>3</StageCount>
                </StageItem>
                <StageItem>
                  <StageHeader>디자인</StageHeader>
                  <StageCount>2</StageCount>
                </StageItem>
                <StageItem>
                  <StageHeader>개발</StageHeader>
                  <StageCount>5</StageCount>
                </StageItem>
                <StageItem>
                  <StageHeader>테스트</StageHeader>
                  <StageCount>0</StageCount>
                </StageItem>
              </StageGrid>
            </StageSection>
            <BoardSection>
              <BoardHeader>
                <SectionTitle>게시판</SectionTitle>
                <CreateButton onClick={() => navigate(`/board-create/${id}`)}>
                  글쓰기
                </CreateButton>
              </BoardHeader>
              <BoardTable>
                <thead>
                  <tr>
                    <BoardHeaderCell>제목</BoardHeaderCell>
                    <BoardHeaderCell>작성자</BoardHeaderCell>
                    <BoardHeaderCell>작성일</BoardHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <BoardRow key={index}>
                      <BoardCell>{post.title}</BoardCell>
                      <BoardCell>작성자 {post.creatorId}</BoardCell>
                      <BoardCell>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}
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

const StageSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const StageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const StageItem = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
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
  border-collapse: separate;
  border-spacing: 0;
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

const BoardCell = styled.td`
  padding: 16px 12px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
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