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
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [postOptionsDropdown, setPostOptionsDropdown] = useState(false);  // Add this line
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
    fetchFiles();
    fetchLinks();
  }, [projectId, postId]);

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const isAdmin = decodedToken?.role === 'ADMIN';
  const userId = decodedToken?.userId;

  const handleFileDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dev.vivim.co.kr/api/files/${fileId}/download`, {
        headers: {
          'Authorization': token
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  const handleUpdateComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editedComment }),
      });
  
      if (response.ok) {
        setEditingCommentId(null);
        setEditedComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };
  
  // Add new state at the top with other states
  const [replyingToId, setReplyingToId] = useState(null);
  
  // Update handleReplyClick function
  const handleReplyClick = (commentId) => {
    setReplyingToId(prevId => prevId === commentId ? null : commentId);
  };
  
  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
  
      if (response.ok) {
        fetchComments();
        setActiveCommentOptions(null);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

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
  const getRoleColor = (role) => {
    switch (role) {
      case 'DEVELOPER':
        return {
          background: '#dbeafe',  // Light blue background
          border: '#93c5fd',      // Blue border
          text: '#2563eb'         // Blue text
        };
      case 'CLIENT':
        return {
          background: '#fef9c3',  // Light yellow background
          border: '#fde047',      // Yellow border
          text: '#ca8a04'         // Yellow text
        };
      case 'ADMIN':
        return {
          background: '#fee2e2',  // Light red background
          border: '#fca5a5',      // Red border
          text: '#dc2626'         // Red text
        };
      default:
        return {
          background: '#f1f5f9',  // Default light gray
          border: '#e2e8f0',      // Default border
          text: '#64748b'         // Default text
        };
    }
  };
  const RoleTag = styled.span`
  padding: 2px 6px;  // 4px 8px에서 축소
  border-radius: 4px;
  font-size: 11px;   // 12px에서 축소
  font-weight: 500;
  background-color: ${props => getRoleColor(props.role).background};
  border: 1px solid ${props => getRoleColor(props.role).border};
  color: ${props => getRoleColor(props.role).text};
  display: inline-block;  // 추가
  line-height: 1.4;      // 추가
`;
  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
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

  const handleCommentSubmit = async (e, parentComment = null) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const parentId = parentComment ? (parentComment.parentId === null ? parentComment.commentId : parentComment.parentId) : null;

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          content: commentContent,
          parentId: parentId
        })
      });

      if (response.ok) {
        setCommentContent('');
        fetchComments();
        if (parentComment) {
          setReplyingToId(null);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
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
                  <div>
                    <PostTitle>{post.title}</PostTitle>
                    <PostCreatorInfo>
                      <CreatorName>{post.creatorName}</CreatorName>
                      <RoleTag role={post.creatorRole}>{post.creatorRole}</RoleTag>
                      <DateText>· {new Date(post.createdAt).toLocaleString()}</DateText>
                    </PostCreatorInfo>
                  </div>
                  {(isAdmin || userId === post.creatorId)  && (
                  <div>
                    <PostMoreOptionsContainer>
                    <MoreOptionsButton onClick={() => setPostOptionsDropdown(prev => !prev)}>
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
                  </div>
                  )}
                </HeaderContent>
              </PostHeader>
              <PostContent>{post.content}</PostContent>
            </PostContainer>
            
            <AttachmentsSection>
              <AttachmentHeader>첨부파일 및 링크</AttachmentHeader>
              <AttachmentContainer>
                <AttachmentGroup>
                  <GroupTitle>파일</GroupTitle>
                  {files.length > 0 ? (
                    <FileList>
                    {files.map((file) => (
                      <FileItem 
                        key={file.id} 
                        onClick={() => handleFileDownload(file.id, file.fileName)}
                        style={{ cursor: 'pointer' }}
                      >
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
              <FormContainer onSubmit={(e) => handleCommentSubmit(e)}>
                <CommentInput
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  maxLength={1000}
                />
                <CharacterCount>
                  {commentContent.length}/1000
                </CharacterCount>
                <ButtonContainer>
                  <SubmitButton type="submit">
                    댓글 작성
                  </SubmitButton>
                </ButtonContainer>
              </FormContainer>
              {comments.length > 0 ? (
                <CommentList>
                  {comments
                    .filter(comment => comment.parentId === null)
                    .map((parentComment) => (
                      <CommentThread key={parentComment.commentId}>
                        <CommentItem>
                          {/* Parent Comment Content */}
                          {editingCommentId === parentComment.commentId ? (
                            <EditCommentForm>
                              <CommentInput
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                maxLength={1000}  // Add this line
                                placeholder="댓글을 입력하세요 (최대 1000자)"  // Add this line
                              />
                              <EditButtonContainer>
                                <SaveButton onClick={() => handleUpdateComment(parentComment.commentId)}>
                                  완료
                                </SaveButton>
                              </EditButtonContainer>
                            </EditCommentForm>
                          ) : (
                            <>
                              <CommentAuthor>
                                <AuthorName>{parentComment.creatorName}</AuthorName>
                                <RoleTag role={parentComment.creatorRole}>{parentComment.creatorRole}</RoleTag>
                              </CommentAuthor>
                              <CommentText>{parentComment.content}</CommentText>
                              <CommentMoreOptionsContainer $isChild={true}>
                              {(isAdmin || userId === parentComment.creatorId) && (
                              <MoreOptionsButton onClick={() => setActiveCommentOptions(prev =>
                                  prev === parentComment.commentId ? null : parentComment.commentId
                                )}>
                                  ⋮
                              </MoreOptionsButton>
                              )}
                                {activeCommentOptions === parentComment.commentId && (
                                  <OptionsDropdown>
                                    <OptionButton onClick={() => {
                                      setEditingCommentId(parentComment.commentId);
                                      setEditedComment(parentComment.content);
                                      setActiveCommentOptions(null);
                                    }}>
                                      수정
                                    </OptionButton>
                                    <OptionButton onClick={() => handleDeleteComment(parentComment.commentId)}>
                                      삭제
                                    </OptionButton>
                                  </OptionsDropdown>
                                )}
                              </CommentMoreOptionsContainer>
                              <CommentActions>
                                <ActionButton onClick={() => handleReplyClick(parentComment.commentId)}>
                                  답글
                                </ActionButton>
                              </CommentActions>
                              <CommentInfo>
                                <CommentDate>
                                  {new Date(parentComment.createdAt).toLocaleString()}
                                </CommentDate>
                              </CommentInfo>
                            </>
                          )}
                        </CommentItem>
                        
                        {replyingToId === parentComment.commentId && (
                          <div style={{ marginLeft: '24px' }}>
                            <FormContainer onSubmit={(e) => handleCommentSubmit(e, parentComment)}>
                            <CommentInput
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              maxLength={1000}
                            />
                            <CharacterCount>
                              {commentContent.length}/1000
                            </CharacterCount>
                            <ButtonContainer>
                              <SubmitButton type="submit">
                                답글 작성
                              </SubmitButton>
                            </ButtonContainer>
                          </FormContainer>
                          </div>
                        )}

                        {/* Child Comments */}
                        {comments
                          .filter(comment => comment.parentId === parentComment.commentId)
                          .map((childComment, index, array) => (
                            <React.Fragment key={childComment.commentId}>
                              <ChildCommentItem>
                                <ReplyIcon>↳</ReplyIcon>
                                {editingCommentId === childComment.commentId ? (
                                  <EditCommentForm>
                                    <CommentInput
                                      value={editedComment}
                                      onChange={(e) => setEditedComment(e.target.value)}
                                    />
                                    <EditButtonContainer>
                                      <SaveButton onClick={() => handleUpdateComment(childComment.commentId)}>
                                        완료
                                      </SaveButton>
                                    </EditButtonContainer>
                                  </EditCommentForm>
                                ) : (
                                  <>
                                      <CommentAuthor>
                                      <AuthorName>{childComment.creatorName}</AuthorName>
                                      <RoleTag role={childComment.creatorRole}>{childComment.creatorRole}</RoleTag>
                                     </CommentAuthor>
                                    <CommentText>{childComment.content}</CommentText>
                                    <CommentMoreOptionsContainer $isChild={true}>
                                      {(isAdmin || userId === childComment.creatorId) && (
                                    <MoreOptionsButton onClick={() => setActiveCommentOptions(prev =>
                                      prev === childComment.commentId ? null : childComment.commentId
                                    )}>
                                      ⋮
                                    </MoreOptionsButton>
                                      )}
                                      {activeCommentOptions === childComment.commentId && (
                                        <OptionsDropdown>
                                          <OptionButton onClick={() => {
                                            setEditingCommentId(childComment.commentId);
                                            setEditedComment(childComment.content);
                                            setActiveCommentOptions(null);
                                          }}>
                                            수정
                                          </OptionButton>
                                          <OptionButton onClick={() => handleDeleteComment(childComment.commentId)}>
                                            삭제
                                          </OptionButton>
                                        </OptionsDropdown>
                                      )}
                                    </CommentMoreOptionsContainer>
                                    <CommentActions>
                                      <ActionButton onClick={() => handleReplyClick(childComment.commentId)}>
                                        답글
                                      </ActionButton>
                                    </CommentActions>
                                    <CommentInfo>
                                      <CommentDate>
                                        {new Date(childComment.createdAt).toLocaleString()}
                                      </CommentDate>
                                    </CommentInfo>
                                  </>
                                )}
                              </ChildCommentItem>
                                {replyingToId === childComment.commentId && (
                                  <div style={{ marginLeft: '48px', marginTop: '8px' }}>
                                <FormContainer onSubmit={(e) => handleCommentSubmit(e, childComment)}>
                                  <CommentInput
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    maxLength={1000}
                                  />
                                  <CharacterCount>
                                    {commentContent.length}/1000
                                  </CharacterCount>
                                  <ButtonContainer>
                                    <SubmitButton type="submit">
                                      답글 작성
                                    </SubmitButton>
                                  </ButtonContainer>
                                </FormContainer>
                              </div>
                            )}
                            </React.Fragment>
                          ))}
                      </CommentThread>
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

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const CommentInput = styled.input`
  width: 98%;
  font-size: 14px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
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

const CharacterCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;


const PostTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-align: left;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
`;

const PostCreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  justify-content: left;  // Add this to center the creator info
`;

const DateText = styled.span`
  font-size: 12px;
  color: #64748b;
  display: inline-block;
  margin-left: 4px;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const AuthorName = styled.span`
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
`;

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

const CommentMoreOptionsContainer = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 1;
  padding-left: 8px;
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
  padding-right: 32px; // Add padding for more options button
  word-break: break-all; // Handle long text without overflow
`;


const CommentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  width: 100%;
`;

const CommentActions = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
`;

const CommentDate = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-left: auto;
`;

const ChildCommentItem = styled(CommentItem)`
  margin-left: 24px;
  display: flex;
  gap: 8px;
  background-color: #f1f5f9;
  flex-direction: column;
  min-height: 80px;
  position: relative;  // Add this
`;

const ReplyIcon = styled.span`
  color: #64748b;
  font-size: 16px;
  position: absolute;
  left: -20px;
  top: 16px;
`;

// Add these new styled components
const EditCommentForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 0 0;  // Add right margin to prevent overlap with options button
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



const NoComments = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin: 16px 0;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CreatorName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
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

const CommentThread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;





const ActionButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    color: #2563eb;
    border-color: #2563eb;
    background-color: #f8fafc;
  }
`;


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
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  

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



export default ProjectPostDetail;

