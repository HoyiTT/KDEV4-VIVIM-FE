import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

const ProjectPostDetail = () => {
  const { projectId, postId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [projectId, postId]);

  const fetchPostDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/posts/${postId}`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setPost(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      console.log('Fetched comments:', data);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
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
        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : post ? (
          <ContentContainer>
            <PostContainer>
              <PostHeader>
                <PostTitle>{post.title}</PostTitle>
              </PostHeader>
              <PostContent>{post.description}</PostContent>
            </PostContainer>
            
            <AttachmentsSection>
              <AttachmentHeader>첨부파일 및 링크</AttachmentHeader>
              <AttachmentContainer>
                <AttachmentGroup>
                  <GroupTitle>파일</GroupTitle>
                  <PlaceholderMessage>아직 등록된 파일이 없습니다.</PlaceholderMessage>
                </AttachmentGroup>
                <AttachmentGroup>
                  <GroupTitle>링크</GroupTitle>
                  <PlaceholderMessage>아직 등록된 링크가 없습니다.</PlaceholderMessage>
                </AttachmentGroup>
              </AttachmentContainer>
            </AttachmentsSection>
                        
            <CommentsSection>
              <CommentHeader>댓글 목록</CommentHeader>
              {comments.length > 0 ? (
                <CommentList>
                  {comments.map((comment, index) => (
                    <CommentItem key={index}>
                      <CommentText>{comment.comment}</CommentText>
                      <CommentInfo>
                        <CommentDate>
                          {new Date(comment.createdAt).toLocaleString()}
                        </CommentDate>
                      </CommentInfo>
                    </CommentItem>
                  ))}
                </CommentList>
              ) : (
                <NoComments>댓글이 없습니다.</NoComments>
              )}
            </CommentsSection>
          </ContentContainer>
        ) : (
          <ErrorMessage>게시글을 찾을 수 없습니다.</ErrorMessage>
        )}
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

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  margin-top: 60px;
`;

const PostContainer = styled.div`
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const PostHeader = styled.div`
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
  margin-bottom: 24px;
`;

const PostTitle = styled.h1`
  font-size: 24px;
  color: #1e293b;
  margin: 0;
`;

const PostContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
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

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const CommentsSection = styled.div`
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const CommentHeader = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const CommentText = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
`;

const CommentInfo = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CommentDate = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const NoComments = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin: 16px 0;
`;

export default ProjectPostDetail;

// Add these styled components at the bottom with other styled components
const AttachmentsSection = styled.div`
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const AttachmentHeader = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const AttachmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AttachmentGroup = styled.div`
  width: 100%;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
`;

const GroupTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const PlaceholderMessage = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  text-align: center;
`;