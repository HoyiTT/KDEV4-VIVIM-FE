import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const ProjectPostCreate = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트 - 관리자');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // 컴포넌트 최상단에 상태 추가
  const [postStatus, setPostStatus] = useState('NORMAL');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // API 요청에 맞는 데이터 구조
      const postData = {
        title: title,
        content: content,
        projectPostStatus: postStatus,
        parentId: 0
      };
  
      // FormData에 JSON 데이터 추가
      formData.append('post', new Blob([JSON.stringify(postData)], {
        type: 'application/json'
      }));
      
      // 파일 추가
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
  
      const response = await fetch(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });
  
      if (response.ok) {
        navigate(`/project/${projectId}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
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

            <AttachmentsSection>
              <SectionTitle>첨부파일 및 링크</SectionTitle>
              <AttachmentContainer>
                <AttachmentGroup>
                  <GroupTitle>파일</GroupTitle>
                  <FileInputLabel>
                    <HiddenFileInput
                      type="file"
                      onChange={handleFileChange}
                      multiple
                    />
                    <UploadButton type="button">파일 업로드</UploadButton>
                  </FileInputLabel>
                </AttachmentGroup>
                <AttachmentGroup>
                  <GroupTitle>링크</GroupTitle>
                  <Input
                    type="url"
                    placeholder="URL을 입력하세요"
                  />
                </AttachmentGroup>
              </AttachmentContainer>
            </AttachmentsSection>

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

const AttachmentsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const SectionTitle = styled.h2`
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
  box-sizing: border-box;
`;

const GroupTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const FileInputLabel = styled.label`
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1e293b;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background-color: #e2e8f0;
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

// styled-components 섹션에 Select 스타일 추가
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