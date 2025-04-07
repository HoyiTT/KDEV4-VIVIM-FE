import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';

const ProjectPostCreate = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  
  // Form states (removed links state)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postStatus, setPostStatus] = useState('NORMAL');
  const [loading, setLoading] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [files, setFiles] = useState([]);
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. 게시글 생성
      const postData = {
        title: title,
        content: content,
        projectPostStatus: postStatus,
        parentId: 0
      };
      
      const postResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
  
      if (!postResponse.ok) {
        throw new Error(`게시글 생성 실패: ${postResponse.status}`);
      }
  
      const postId = await postResponse.json();
  
      // 2. 링크가 입력된 경우에만 링크 생성
      if (linkTitle && linkUrl) {
        const linkData = {
          title: linkTitle,
          url: linkUrl
        };
  
        const linkResponse = await fetch(`${API_BASE_URL}/posts/${postId}/link`, {
          method: 'POST',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linkData)
        });
  
        if (!linkResponse.ok) {
          throw new Error(`링크 생성 실패: ${linkResponse.status}`);
        }
      }
  
      // 3. 파일 업로드
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
  
          const fileResponse = await fetch(`${API_BASE_URL}/posts/${postId}/file/stream`, {
            method: 'POST',
            headers: {
              'Authorization': `${token}`
            },
            body: formData
          });
  
          if (!fileResponse.ok) {
            throw new Error(`파일 업로드 실패: ${fileResponse.status}`);
          }
        }
      }
  
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('오류:', error);
      alert('게시글 작성 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={(menuItem) => setActiveMenuItem(menuItem)}
      />
      <MainContent>
        <ContentContainer>
          <Header>
            <PageTitle>게시글 작성</PageTitle>
          </Header>

          <FormContainer onSubmit={handleSubmit}>
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
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value)}
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
              <Label>링크 제목 (선택사항)</Label>
              <Input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="링크 제목을 입력하세요"
              />
            </InputGroup>

            <InputGroup>
              <Label>URL (선택사항)</Label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL을 입력하세요"
              />
            </InputGroup>

            <InputGroup>
              <Label>파일 첨부 (선택사항)</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                multiple
              />
            </InputGroup>

            <ButtonContainer>
              <CancelButton type="button" onClick={() => navigate(`/project/${projectId}`)}>
                취소
              </CancelButton>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </SubmitButton>
            </ButtonContainer>
          </FormContainer>
        </ContentContainer>
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
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

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 200px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  &:hover {
    background-color: #e2e8f0;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #2563eb;
  border: none;
  color: white;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

export default ProjectPostCreate;