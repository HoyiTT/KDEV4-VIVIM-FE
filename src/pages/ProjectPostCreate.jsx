import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosInstance';

const ProjectPostCreate = () => {
  const { projectId } = useParams();
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
  const [linkUrlError, setLinkUrlError] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [links, setLinks] = useState([]);
  
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    'application/pdf', 'application/rtf', 'text/plain', 'text/rtf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
    'application/json', 'application/xml', 'text/html', 'text/css', 'application/javascript'
  ];

  // 파일 크기 제한 상수 추가 (500MB in bytes)
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  useEffect(() => {
    if (parentPost) {
      console.log('parentPost 데이터:', parentPost);
    }
  }, [parentPost]);

  const handleFileDelete = (indexToDelete) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToDelete));
  };
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // 파일 크기 검증
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert('500MB 이상의 파일은 업로드할 수 없습니다:\n' + 
        oversizedFiles.map(file => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`).join('\n'));
      e.target.value = ''; // 파일 선택 초기화
      return;
    }

    // 기존 파일들과 새로 선택한 파일들을 합침
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    e.target.value = ''; // 파일 선택 초기화
  };

  // URL 형식 검증 함수
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 링크 추가 함수
  const handleAddLink = () => {
    if (!linkTitle || !linkUrl) {
      return;
    }

    if (!isValidUrl(linkUrl)) {
      setLinkUrlError('올바른 URL 형식이 아닙니다. (예: https://www.example.com)');
      return;
    }

    setLinks(prevLinks => [...prevLinks, { title: linkTitle, url: linkUrl }]);
    setLinkTitle('');
    setLinkUrl('');
    setLinkUrlError('');
  };

  // 링크 삭제 함수
  const handleLinkDelete = (indexToDelete) => {
    setLinks(prevLinks => prevLinks.filter((_, index) => index !== indexToDelete));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 로딩 상태 시작

    try {
      // 1. 게시글 생성
      const { data: postData } = await axiosInstance.post(API_ENDPOINTS.PROJECT_POSTS(projectId), {
        title: parentPost ? `[Reply : ${parentPost.title.replace(/\[Reply\s*:\s*.*?\]\s*-\s*/, '')}] - ${title}` : title,
        content,
        projectPostStatus: postStatus,
        parentId: parentPost ? (parentPost.parentId === null ? parentPost.postId : parentPost.parentId) : null,
        links: links.map(link => ({
          title: link.title,
          url: link.url
        }))
      }, {
        withCredentials: true
      });

      const createdPostId = postData;

      // 2. 파일 업로드 처리 (멀티파트 업로드)
      if (files.length > 0) {
        for (const file of files) {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`파일 크기 제한 초과: ${file.name}`);
          }

          // 1. 멀티파트 업로드를 위한 presigned URL 요청
          const { data: presignedData } = await axiosInstance.post(
            API_ENDPOINTS.PROJECT_POST_FILE_MULTIPART(createdPostId),
            {
              fileName: file.name,
              fileSize: file.size,
              contentType: file.type
            },
            {
              withCredentials: true
            }
          );

          const { objectKey, uploadId, presignedParts } = presignedData;

          // 2. 각 파트 업로드 (병렬 처리)
          const partSize = 25 * 1000 * 1000; // 25MB
          const totalParts = Math.ceil(file.size / partSize);
          const uploadPromises = [];

          for (let i = 0; i < totalParts; i++) {
            const start = i * partSize;
            const end = Math.min(start + partSize, file.size);
            const chunk = file.slice(start, end);
            const partNumber = i + 1;
            const presignedUrl = presignedParts.find(part => part.partNumber === partNumber).presignedUrl;

            uploadPromises.push(
              fetch(presignedUrl, {
                method: 'PUT',
                body: chunk,
                headers: {
                  'Content-Type': file.type
                }
              }).then(async (response) => {
                if (!response.ok) {
                  throw new Error(`파일 파트 업로드 실패: ${file.name} (파트 ${partNumber})`);
                }
                const etag = response.headers.get('ETag');
                return {
                  partNumber,
                  etag
                };
              })
            );
          }

          // 모든 파트 업로드가 완료될 때까지 대기
          const uploadedParts = await Promise.all(uploadPromises);

          // 3. 멀티파트 업로드 완료 요청
          await axiosInstance.post(
            API_ENDPOINTS.PROJECT_POST_FILE_COMPLETE(),
            {
              key: objectKey,
              uploadId: uploadId,
              parts: uploadedParts
            },
            {
              withCredentials: true
            }
          );
        }
      }

      // 3. 링크 업로드 처리
      if (links.length > 0) {
        for (const link of links) {
          await axiosInstance.post(
            API_ENDPOINTS.PROJECT_POST_LINK(projectId, createdPostId),
            {
              title: link.title,
              url: link.url
            },
            {
              withCredentials: true
            }
          );
        }
      }

      setLoading(false); // 로딩 상태 종료
      navigate(`/project/${projectId}`); // 성공 시 이동
      
    } catch (error) {
      setLoading(false); // 에러 발생 시에도 로딩 상태 종료
      console.error('Error:', error);
      alert('게시글 작성 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <PageContainer>
      <MainContent>
        <ContentContainer>
          <HeaderContainer>
            <BackButton onClick={() => navigate(`/project/${projectId}`)}>
              <span>←</span>
              뒤로가기
            </BackButton>
            <PageTitle>게시글 작성</PageTitle>
          </HeaderContainer>

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
              <Label>링크 (선택사항)</Label>
              <LinkInputContainer>
                <LinkInputGroup>
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
                </LinkInputGroup>
                
                <LinkInputGroup>
                  <Input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        setLinkUrl(value);
                        if (value && !isValidUrl(value)) {
                          setLinkUrlError('올바른 URL 형식이 아닙니다. (예: https://www.example.com)');
                        } else {
                          setLinkUrlError('');
                        }
                      }
                    }}
                    placeholder="URL을 입력하세요 (예: https://www.example.com)"
                    maxLength={1000}
                  />
                  <CharacterCount>
                    {linkUrl.length}/1000
                  </CharacterCount>
                  {linkUrlError && <ErrorMessage>{linkUrlError}</ErrorMessage>}
                </LinkInputGroup>
                <AddButton
                  type="button"
                  onClick={handleAddLink}
                  disabled={!linkTitle || !linkUrl}
                >
                  추가
                </AddButton>
              </LinkInputContainer>
              {links.length > 0 && (
                <LinkList>
                  {links.map((link, index) => (
                    <LinkItem key={index}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔗 {link.title}
                        <span style={{ color: '#64748b', marginLeft: '8px' }}>
                          ({link.url})
                        </span>
                      </div>
                      <DeleteButton
                        type="button"
                        onClick={() => handleLinkDelete(index)}
                      >
                        ✕
                      </DeleteButton>
                    </LinkItem>
                  ))}
                </LinkList>
              )}
            </InputGroup>

            <InputGroup>
              <Label>파일 첨부 (선택사항)</Label>
              <FileInputContainer>
                <div style={{ display: 'flex', gap: '12px' }}>
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
                </div>
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
                {fileError && <ErrorMessage>{fileError}</ErrorMessage>}
              </FileInputContainer>
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

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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

const LinkInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const LinkInputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const LinkList = styled(FileList)``;

const LinkItem = styled(FileItem)``;

const AddButton = styled(Button)`
  background-color: #2E7D32;
  border: none;
  color: white;
  padding: 12px 20px;
  margin-top: 2px;
  height: 65px;
  &:hover {
    background-color: #1B5E20;
  }
  
  &:disabled {
    background-color: #e2e8f0;
    cursor: not-allowed;
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

const HeaderContainer = styled.div`
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
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
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Add these new styled components
const FileInputContainer = styled.div`
  margin-bottom: 16px;

  &::after {
    content: '* 파일 크기는 500MB 이하여야 합니다.';
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
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

const CancelButton = styled(Button)`
  background-color: white;
  border: 1px solid #e2e8f0;
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

export default ProjectPostCreate;