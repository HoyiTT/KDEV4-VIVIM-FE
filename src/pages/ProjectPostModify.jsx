import React, { useState, useEffect } from 'react';  // useEffect 추가
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';

const API_BASE_URL = 'https://dev.vivim.co.kr/api';



const ProjectPostModify = () => {
  const { projectId, postId } = useParams();  // postId 추가
  const navigate = useNavigate();
  const { state } = useLocation();
  const parentPost = state?.parentPost;  // 라우터의 state에서 parentPost 가져오기
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  
  // Form states (removed links state)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postStatus, setPostStatus] = useState('NORMAL');
  const [loading, setLoading] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    'application/pdf', 'application/rtf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
    'application/json', 'application/xml', 'text/html', 'text/css', 'application/javascript'
  ];


  const handleFileDelete = (indexToDelete) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToDelete));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter(file => !allowedMimeTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setFileError('지원하지 않는 파일 형식이 포함되어 있습니다.');
      e.target.value = ''; // Reset file input
    } else {
      setFileError('');
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]); // 기존 파일 목록에 새 파일들 추가
    }
  };

  // 기존 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/posts/${postId}`, {
          headers: {
            'Authorization': token
          }
        });
        const data = await response.json();
        
        // 기존 데이터로 상태 초기화
        setTitle(data.title);
        setContent(data.content);
        setPostStatus(data.projectPostStatus);
        
        // 링크 데이터가 있는 경우
        if (data.links && data.links.length > 0) {
          setLinkTitle(data.links[0].title);
          setLinkUrl(data.links[0].url);
        }
      } catch (error) {
        console.error('게시글 조회 중 오류 발생:', error);
      }
    };

    fetchPostDetail();
  }, [projectId, postId]);

  // handleSubmit 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 게시글 수정
      const postData = {
        title: title,
        content: content,
        projectPostStatus: postStatus
      };
      
      const postResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
  
      if (!postResponse.ok) {
        throw new Error(`게시글 수정 실패: ${postResponse.status}`);
      }

      // 링크 수정
      if (linkTitle && linkUrl) {
        const linkData = {
          title: linkTitle,
          url: linkUrl
        };
  
        const linkResponse = await fetch(`${API_BASE_URL}/posts/${postId}/link`, {
          method: 'PUT',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linkData)
        });
  
        if (!linkResponse.ok) {
          throw new Error(`링크 수정 실패: ${linkResponse.status}`);
        }
      }
  
      // 파일 업로드
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
  
      navigate(`/project/${projectId}/post/${postId}`);
    } catch (error) {
      console.error('오류:', error);
      alert('게시글 수정 중 오류가 발생했습니다: ' + error.message);
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
            <PageTitle>게시글 수정</PageTitle>
          </Header>

          <FormContainer onSubmit={handleSubmit}>
            <InputGroup>
              <Label>제목</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= 60) {
                    setTitle(e.target.value);
                  }
                }}
                placeholder="제목을 입력하세요"
                maxLength={60}
                required
              />
              <CharacterCount>
                {title.length}/60
              </CharacterCount>
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
                onChange={(e) => {
                  if (e.target.value.length <= 10000) {
                    setContent(e.target.value);
                  }
                }}
                placeholder="내용을 입력하세요"
                maxLength={10000}
                required
              />
              <CharacterCount>
                {content.length}/10000
              </CharacterCount>
            </InputGroup>

            <InputGroup>
              <Label>링크 제목 (선택사항)</Label>
              <Input
                type="text"
                value={linkTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 60) {
                    setLinkTitle(e.target.value);
                  }
                }}
                placeholder="링크 제목을 입력하세요"
                maxLength={60}
              />
              <CharacterCount>
                {linkTitle.length}/60
              </CharacterCount>
            </InputGroup>

            <InputGroup>
              <Label>URL (선택사항)</Label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setLinkUrl(e.target.value);
                  }
                }}
                placeholder="URL을 입력하세요"
                maxLength={1000}
              />
              <CharacterCount>
                {linkUrl.length}/1000
              </CharacterCount>
            </InputGroup>

            <InputGroup>
                <Label>파일 첨부 (선택사항)</Label>
                <FileInputContainer>
                  <HiddenFileInput
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept={allowedMimeTypes.join(',')}
                    id="fileInput"
                  />
                  <FileButton type="button" onClick={() => document.getElementById('fileInput').click()}>
                    파일 선택
                  </FileButton>
                </FileInputContainer>
                {files.length > 0 && (
                  <FileList>
                    {Array.from(files).map((file, index) => (
                      <FileItem key={index}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📎 {file.name}
                        </div>
                        <DeleteButton
                          type="button"
                          onClick={() => handleFileDelete(index)}
                        >
                          ✕
                        </DeleteButton>
                      </FileItem>
                    ))}
                  </FileList>
                )}
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

const FileList = styled.ul`
  list-style: none;
  padding: 8px 16px;
  margin: 8px 0 0 0;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  
  &:hover {
    color: #ef4444;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Add these new styled components
const FileInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileButton = styled.button`
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8fafc;
  }
`;
const ErrorMessage = styled.span`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

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
  background-color: white;
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
  border: 1px solid #e2e8f0;
  background-color: white;

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

const CharacterCount = styled.span`
  font-size: 12px;
  color: ${props => props.theme.isNearLimit ? '#ef4444' : '#64748b'};
  text-align: right;
  margin-top: 4px;
`;

export default ProjectPostModify;