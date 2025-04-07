import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import CommentForm from '../components/CommentForm';

const ProjectPostDetail = () => {
  const { projectId, postId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [postOptionsDropdown, setPostOptionsDropdown] = useState(false);  // Add this line
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
    fetchFiles();
    fetchLinks();
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

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/files`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/links`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
    
      if (response.ok) {
        navigate(`/project/${projectId}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
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
                <HeaderContent>
                  <PostTitle>{post.title}</PostTitle>
                  <PostMoreOptionsContainer>
                    <MoreOptionsButton onClick={() => setPostOptionsDropdown(!postOptionsDropdown)}>
                      ⋮
                    </MoreOptionsButton>
                    {postOptionsDropdown && (
                      <OptionsDropdown>
                        <OptionButton onClick={() => {
                          navigate(`/project/${projectId}/post/${postId}/modify`);
                          setPostOptionsDropdown(false);
                        }}>
                          수정
                        </OptionButton>
                        <OptionButton onClick={() => {
                          handleDeletePost();
                          setPostOptionsDropdown(false);
                        }}>
                          삭제
                        </OptionButton>
                      </OptionsDropdown>
                    )}
                  </PostMoreOptionsContainer>
                </HeaderContent>
              </PostHeader>
              <PostContent>{post.description}</PostContent>
            </PostContainer>
            
            <AttachmentsSection>
              <AttachmentHeader>첨부파일 및 링크</AttachmentHeader>
              <AttachmentContainer>
                <AttachmentGroup>
                  <GroupTitle>파일</GroupTitle>
                  {files.length > 0 ? (
                    <FileList>
                      {files.map((file, index) => (
                        <FileItem key={index}>
                          <FileIcon>📎</FileIcon>
                          <FileName>{file.fileName}</FileName>
                        </FileItem>
                      ))}
                    </FileList>
                  ) : (
                    <PlaceholderMessage>아직 등록된 파일이 없습니다.</PlaceholderMessage>
                  )}
                </AttachmentGroup>
                <AttachmentGroup>
                  <GroupTitle>링크</GroupTitle>
                  {links.length > 0 ? (
                    <LinkList>
                      {links.map((link, index) => (
                        <LinkItem key={index} onClick={() => window.open(link.url, '_blank')}>
                          <LinkIcon>🔗</LinkIcon>
                          <LinkTitle>{link.title}</LinkTitle>
                        </LinkItem>
                      ))}
                    </LinkList>
                  ) : (
                    <PlaceholderMessage>아직 등록된 링크가 없습니다.</PlaceholderMessage>
                  )}
                </AttachmentGroup>
              </AttachmentContainer>
            </AttachmentsSection>
                        
            <CommentsSection>
              <CommentHeader>댓글 목록</CommentHeader>
              <CommentForm 
                postId={postId} 
                onCommentSubmit={fetchComments}
              />
              {comments.length > 0 ? (
                <CommentList>
                 {comments.map((comment) => (
  <CommentItem key={comment.commentId}>
    {editingCommentId !== comment.commentId && (
      <CommentMoreOptionsContainer>
        <MoreOptionsButton
          onClick={(e) => {
            e.stopPropagation();
            // Toggle visibility for the specific comment
            setActiveCommentOptions(
              activeCommentOptions === comment.commentId ? null : comment.commentId
            );
          }}
        >

          ⋮
        </MoreOptionsButton>
        {activeCommentOptions === comment.commentId && (
          <OptionsDropdown onClick={(e) => e.stopPropagation()}>
            <OptionButton
              onClick={() => {
                setEditingCommentId(comment.commentId);
                setEditedComment(comment.content);
                setActiveCommentOptions(null);
              }}
            >
              수정
            </OptionButton>
            <OptionButton
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${comment.commentId}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': token
                    }
                  });

                  if (response.ok) {
                    setActiveCommentOptions(null);
                    fetchComments(); // 댓글 목록 새로고침
                  }
                } catch (error) {
                  console.error('Error deleting comment:', error);
                }
              }}
            >
              삭제
            </OptionButton>
          </OptionsDropdown>
        )}
      </CommentMoreOptionsContainer>
    )}
    {editingCommentId === comment.commentId ? (
      <EditCommentForm>
        <CommentInput
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
        />
        <EditButtonContainer>
          <SaveButton
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${comment.commentId}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    content: editedComment,
                    parentId: 0
                  })
                });
    
                if (response.ok) {
                  setEditingCommentId(null);
                  fetchComments();
                }
              } catch (error) {
                console.error('Error updating comment:', error);
              }
            }}
          >
            완료
          </SaveButton>
        </EditButtonContainer>
      </EditCommentForm>
    ) : (
      <>
        <CommentText>{comment.content}</CommentText>
        <CommentInfo>
          <CommentDate>
            {new Date(comment.createdAt).toLocaleString()}
          </CommentDate>
        </CommentInfo>
      </>
    )}
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
  position: relative;
`;

// Remove the JSX code from styled components section and keep only the styled component definitions
const CommentMoreOptionsContainer = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 1;
`;

const OptionsDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
  min-width: 80px;
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

// Add these new styled components
const EditCommentForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 24px 0 0;  // Add right margin to prevent overlap with options button
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  max-height: 150px;  // Add max-height to prevent too large expansion

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

// Add these new styled components
const EditButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;

const SaveButton = styled.button`
  padding: 6px 12px;
  background-color: #2563eb;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
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

// Add these new styled components
const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  &:hover {
    background-color: #f1f5f9;
  }
`;

const FileIcon = styled.span`
  font-size: 16px;
`;

const FileName = styled.span`
  font-size: 14px;
  color: #1e293b;
`;

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

// 파일 맨 아래에 추가
const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LinkItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  &:hover {
    background-color: #f1f5f9;
  }
`;

const LinkIcon = styled.span`
  font-size: 16px;
`;

const LinkTitle = styled.span`
  font-size: 14px;
  color: #2563eb;
  text-decoration: underline;
`;

// Move these styled components to the top
const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;



const PostMoreOptionsContainer = styled.div`
  position: relative;
`;



const MoreOptionsButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  
  &:hover {
    color: #475569;
  }
`;



const OptionButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;

  &:hover {
    background-color: #f1f5f9;
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #bbf7d0;
    color: #15803d;
  }
`;

export default ProjectPostDetail;