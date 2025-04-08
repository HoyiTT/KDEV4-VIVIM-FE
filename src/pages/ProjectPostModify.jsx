import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

const ProjectPostModify = () => {
  // Add new state variables
  // Add newFiles state
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [newLinks, setNewLinks] = useState({ title: '', url: '' });
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [linksToDelete, setLinksToDelete] = useState([]);



    // ... rest of the code
  const { projectId, postId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');  // description -> content
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostDetail();
    fetchFiles();
    fetchLinks();
  }, [projectId, postId]);

  const fetchPostDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/posts/${postId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      const data = await response.json();
      setTitle(data.title);
      setContent(data.content);  // description -> content
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/files`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
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
          'Authorization': `${token}`
        }
      });
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  // Add new state variable near the top with other states
  const [projectPostStatus, setProjectPostStatus] = useState('NORMAL');

  // handleSubmit 함수 수정
  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
  
        // Delete files first
        for (const fileId of filesToDelete) {
          await fetch(`${API_BASE_URL}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': token,
            }
          });
        }
  
        // Delete links
        for (const linkId of linksToDelete) {
          await fetch(`${API_BASE_URL}/links/${linkId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': token,
            }
          });
        }
        
        // Update the post
        const requestBody = {
          title: title,
          content: content,
          projectPostStatus: projectPostStatus,
          parentId: null
        };
        
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
        });
  
        if (response.ok) {
          for (const file of newFiles) {
            const formData = new FormData();
            formData.append('file', file);
      
            await fetch(`${API_BASE_URL}/posts/${postId}/file/stream`, {
              method: 'POST',
              headers: {
                'Authorization': token,
              },
              body: formData,
            });
          }
  
          if (newLinks.title && newLinks.url) {
          // Create new links if any
            for (const link of newLinks) {
              // Upload new files...
    
              // Create new link if title and url exist
              
                await fetch(`${API_BASE_URL}/posts/${postId}/link`, {
                  method: 'POST',
                  headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    title: newLinks.title,
                    url: newLinks.url
                  }),
                });
              }
  
            navigate(`/project/${projectId}/post/${postId}`);
          }
          console.log('Post updated successfully');
          navigate(`/project/${projectId}/post/${postId}`);
          console.log('Post updated successfully1');
        }
      } catch (error) {
        console.error('Error updating post:', error);
      }
  };

  // Add new handlers
  const handleFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const handleLinkInputChange = (e, field) => {
    const value = e.target.value;
    if (field === 'title') {
      setNewLinks({ ...newLinks, title: value });
    } else if (field === 'url') {
      setNewLinks({ ...newLinks, url: value });
    }
  };

  
  // Update the handlers
  const handleFileRemove = (fileId) => {
    setFilesToDelete([...filesToDelete, fileId]);
    setFiles(files.filter(file => file.id !== fileId));
  };
  
  const handleLinkRemove = (index, linkId) => {
    setLinksToDelete([...linksToDelete, linkId]);
    setLinks(links.filter((_, i) => i !== index));
  };
  

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={(menuItem) => setActiveMenuItem(menuItem)}
      />
      <MainContent>
        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <ContentContainer>
            <FormContainer onSubmit={handleSubmit}>
              <FormHeader>게시글 수정</FormHeader>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>게시글 상태</Label>
                <Select
                  value={projectPostStatus}
                  onChange={(e) => setProjectPostStatus(e.target.value)}
                >
                  <option value="NORMAL">일반</option>
                  <option value="NOTIFICATION">공지사항</option>
                  <option value="QUESTION">질문</option>
                </Select>
              </InputGroup>
              <InputGroup>
                <Label>내용</Label>
                <TextArea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>첨부 파일</Label>
                <FileInput
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />
                {files.length > 0 ? (
                  <FileList>
                    {files.map((file, index) => (
                      <FileItem key={index}>
                        <FileIcon>📎</FileIcon>
                        <FileName>{file.fileName}</FileName>
                        <RemoveButton type="button" onClick={() => handleFileRemove(file.id)}>✕</RemoveButton>
                      </FileItem>
                    ))}
                    

            
                  </FileList>
                ) : (
                  <PlaceholderMessage>아직 등록된 파일이 없습니다.</PlaceholderMessage>
                )}
              </InputGroup>

              <InputGroup>
                <Label>링크</Label>
                <LinkInputContainer>
                  <Input
                    type="text"
                    placeholder="링크 제목"
                    onChange={(e) => handleLinkInputChange(e, 'title')}
                    value={newLinks.title}
                  />
                  <Input
                    type="url"
                    placeholder="URL"
                    onChange={(e) => handleLinkInputChange(e, 'url')}
                    value={newLinks.url}
                  />
                </LinkInputContainer>
                {links.length > 0 && (
                  <LinkList>
                    {links.map((link, index) => (
                      <LinkItem key={index}>
                        <LinkIcon>🔗</LinkIcon>
                        <LinkTitle>{link.title}</LinkTitle>
                        <RemoveButton 
                          type="button" 
                          onClick={() => handleLinkRemove(index, link.id)}
                        >
                          ✕
                        </RemoveButton>
                      </LinkItem>
                    ))}
                  </LinkList>
                )}
              </InputGroup>

              <ButtonGroup>
                <CancelButton type="button" onClick={() => navigate(`/project/${projectId}/post/${postId}`)}>
                  취소
                </CancelButton>
                <SubmitButton type="submit">
                  수정하기
                </SubmitButton>
              </ButtonGroup>
            </FormContainer>
          </ContentContainer>
        )}
      </MainContent>
    </PageContainer>
  );
};

// Add new styled components
const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
`;

const FileList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f8fafc;
  border-radius: 4px;
`;

const FileIcon = styled.span`
  font-size: 16px;
`;

const FileName = styled.span`
  font-size: 14px;
  color: #1e293b;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;

  &:hover {
    color: #dc2626;
  }
`;

const LinkInputContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const AddLinkButton = styled.button`
  padding: 10px 20px;
  background-color: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: #bbf7d0;
    color: #15803d;
  }
`;

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
  background-color: #f8fafc;
  border-radius: 4px;
`;

const LinkIcon = styled.span`
  font-size: 16px;
`;

const LinkTitle = styled.span`
  font-size: 14px;
  color: #1e293b;
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

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const FormContainer = styled.form`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const FormHeader = styled.h1`
  font-size: 24px;
  color: #1e293b;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  
  &:focus {
    outline: none;
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  
  &:hover {
    background-color: #e2e8f0;
    color: #475569;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #dcfce7;
  border: 1px solid #86efac;
  color: #16a34a;
  
  &:hover {
    background-color: #bbf7d0;
    color: #15803d;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const PlaceholderMessage = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  text-align: center;
`;

export default ProjectPostModify;

// Add this with other styled-components at the bottom
const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.1);
  }
`;