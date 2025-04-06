import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

const ProjectPostModify = () => {
  // Add new state variables
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const { projectId, postId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostDetail();
    fetchFiles();
    fetchLinks();
  }, [projectId, postId]);

  const fetchPostDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost/api/projects/${projectId}/posts/${postId}`, {
        headers: {
          // 'Authorization': `${token}`
        }
      });
      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost/api/posts/${postId}/files`, {
        headers: {
          // 'Authorization': `${token}`,
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
      const response = await fetch(`https://localhost/api/posts/${postId}/links`, {
        headers: {
          // 'Authorization': `${token}`
        }
      });
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      // Append files
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Append links
      formData.append('links', JSON.stringify(links));

      const response = await fetch(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (response.ok) {
        navigate(`/project/${projectId}/post/${postId}`);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // Add new handlers
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleLinkAdd = () => {
    if (newLink.title && newLink.url) {
      setLinks([...links, newLink]);
      setNewLink({ title: '', url: '' });
    }
  };

  // Add these state variables at the top with other states
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [linksToDelete, setLinksToDelete] = useState([]);
  
  // Update the handlers
  const handleFileRemove = (fileId) => {
    setFilesToDelete([...filesToDelete, fileId]);
    setFiles(files.filter(file => file.id !== fileId));
  };
  
  const handleLinkRemove = (index, linkId) => {
    setLinksToDelete([...linksToDelete, linkId]);
    setLinks(links.filter((_, i) => i !== index));
  };
  
  // Update the file and link rendering in return statement
  {files.map((file, index) => (
    <FileItem key={index}>
      <FileIcon>📎</FileIcon>
      <FileName>{file.fileName}</FileName>
      <RemoveButton onClick={() => console.log('Clicked file ID:', file.id)}>✕</RemoveButton>
    </FileItem>
  ))}
  
  {links.map((link, index) => (
    <LinkItem key={index}>
      <LinkIcon>🔗</LinkIcon>
      <LinkTitle>{link.title}</LinkTitle>
      <RemoveButton onClick={() => handleLinkRemove(index, link.id)}>✕</RemoveButton>
    </LinkItem>
  ))}

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
                <Label>내용</Label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                        <RemoveButton>✕</RemoveButton>
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
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  />
                  <Input
                    type="url"
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  />
                  <AddLinkButton type="button" onClick={handleLinkAdd}>
                    추가
                  </AddLinkButton>
                </LinkInputContainer>
                {links.length > 0 && (
                  <LinkList>
                    {links.map((link, index) => (
                      <LinkItem key={index}>
                        <LinkIcon>🔗</LinkIcon>
                        <LinkTitle>{link.title}</LinkTitle>
                        <RemoveButton>✕</RemoveButton>
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