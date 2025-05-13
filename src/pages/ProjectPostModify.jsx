import React, { useState, useEffect } from 'react';  
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import MainContent from '../components/common/MainContent';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios'; 
import FileLinkDeleter from '../components/common/FileLinkDeleter';

// 파일 크기 제한 상수 
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// 반드시 컴포넌트 함수 바깥에서 선언!
const RoleTag = styled.span`
  // 스타일 정의
`;

const ProjectPostModify = () => {
  const { projectId, postId } = useParams(); 
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const parentPost = state?.parentPost;  // 라우터의 state에서 parentPost 가져오기
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postStatus, setPostStatus] = useState('NORMAL');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [linksToDelete, setLinksToDelete] = useState([]);
  const [existingLinks, setExistingLinks] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [newLinks, setNewLinks] = useState([]);
  const [linkUrlError, setLinkUrlError] = useState('');

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROJECT_DETAIL(projectId) + `/posts/${postId}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch post details');
        }
        const data = await response.json();
        setTitle(data?.title || '');
        setContent(data?.content || '');
        setPostStatus(data?.projectPostStatus || 'NORMAL');
      } catch (error) {
        console.error('Error fetching post:', error);
        setTitle('');
        setContent('');
      }
    };
  
    fetchPostDetail();
    fetchLinks();
    fetchFiles();
  }, [projectId, postId]);
  
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    'application/pdf', 'application/rtf', 'text/plain', 'text/rtf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
    'application/json', 'application/xml', 'text/html', 'text/css', 'application/javascript'
  ];

  // URL 형식 검증 함수
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddFile = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // 파일 형식 검증
    const invalidTypeFiles = selectedFiles.filter(file => !allowedMimeTypes.includes(file.type));
    
    // 파일 크기 검증
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (invalidTypeFiles.length > 0) {
      setFileError('지원하지 않는 파일 형식이 포함되어 있습니다.');
      e.target.value = '';
      return;
    }
    
    if (oversizedFiles.length > 0) {
      alert('500MB 이상의 파일은 업로드할 수 없습니다:\n');
      setFileError('500MB 이상의 파일은 업로드할 수 없습니다.');
      e.target.value = '';
      return;
    }
    
    setFileError('');
    // 기존 파일 목록에 새로운 파일들을 추가
    setNewFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      selectedFiles.forEach(file => {
        // 중복 파일 체크 (파일 이름으로 비교)
        const isDuplicate = updatedFiles.some(existingFile => existingFile.name === file.name);
        if (!isDuplicate) {
          updatedFiles.push(file);
        }
      });
      return updatedFiles;
    });
    
    // 파일 입력 초기화
    e.target.value = '';
  };
  
  const handleFileDelete = (index, isExisting) => {
    if (isExisting) {
      const fileToDelete = existingFiles[index];  // Changed from filesToDelete to existingFiles
      setFilesToDelete(prev => [...prev, fileToDelete.id]);
      setExistingFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewFiles(prev => prev.filter((_, i) => i !== index));
    }
  };
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/files`, {
        credentials: 'include'
      });
      const data = await response.json();
      setExistingFiles(data.map(file => ({
        id: file.id,
        name: file.fileName
      })));
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };
  // Update fetchLinks function
  const fetchLinks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/links`, {
        credentials: 'include'
      });
      const data = await response.json();
      setExistingLinks(data.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url
      })));
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  // Update handleAddLink
  const handleAddLink = () => {
    if (!linkTitle || !linkUrl) {
      return;
    }

    if (!isValidUrl(linkUrl)) {
      setLinkUrlError('올바른 URL 형식이 아닙니다. (예: https://www.example.com)');
      return;
    }

    setNewLinks([...newLinks, { title: linkTitle, url: linkUrl }]);
    setLinkTitle('');
    setLinkUrl('');
    setLinkUrlError('');
  };
  
  // Update handleLinkDelete
  const handleLinkDelete = (index, isExisting) => {
    if (isExisting) {
      const linkToDelete = existingLinks[index];
      setLinksToDelete(prev => [...prev, linkToDelete.id]);
      setExistingLinks(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewLinks(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 게시글 수정
      const postData = {
        title: title.trim(),
        content: content.trim(),
        projectPostStatus: postStatus
      };

      const postResponse = await fetch(API_ENDPOINTS.PROJECT_DETAIL(projectId) + `/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(postData)
      });
  
      if (!postResponse.ok) {
        throw new Error(`게시글 수정 실패: ${postResponse.status}`);
      }
  
      // Delete links that were marked for deletion
      for (const linkId of linksToDelete) {
        const deleteLinkResponse = await fetch(API_ENDPOINTS.LINK_DELETE(linkId), {
          method: 'PATCH',
          credentials: 'include'
        });
  
        if (!deleteLinkResponse.ok) {
          throw new Error(`링크 삭제 실패: ${deleteLinkResponse.status}`);
        }
      }

      for (const fileId of filesToDelete) {
        const deleteFileResponse = await fetch(API_ENDPOINTS.FILE_DELETE(fileId), {
          method: 'PATCH',
          credentials: 'include'
        });

        if (!deleteFileResponse.ok) {
          throw new Error(`파일 삭제 실패: ${deleteFileResponse.status}`);
        }
      }
  
      // Add new links
      for (const link of newLinks) {
        const linkData = {
          title: link.title,
          url: link.url
        };
  
        const linkResponse = await fetch(API_ENDPOINTS.PROJECT_POST_LINK(projectId, postId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(linkData)
        });
  
        if (!linkResponse.ok) {
          throw new Error(`링크 추가 실패: ${linkResponse.status}`);
        }
      }
  
      // Add new files
      for (const file of newFiles) {
        try {
          // 1. 멀티파트 업로드를 위한 presigned URL 요청
          const presignedResponse = await fetch(API_ENDPOINTS.PROJECT_POST_FILE_MULTIPART(postId), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              fileName: file.name,
              fileSize: file.size,
              contentType: file.type
            })
          });

          if (!presignedResponse.ok) {
            throw new Error(`Presigned URL 요청 실패: ${file.name}`);
          }

          const { objectKey, uploadId, presignedParts } = await presignedResponse.json();

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
          const completeResponse = await fetch(API_ENDPOINTS.PROJECT_POST_FILE_COMPLETE(postId), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              key: objectKey,
              uploadId: uploadId,
              parts: uploadedParts
            })
          });

          if (!completeResponse.ok) {
            throw new Error(`멀티파트 업로드 완료 실패: ${file.name}`);
          }

        } catch (error) {
          console.error('파일 업로드 중 오류 발생:', error);
          throw error;
        }
      }
  
      navigate(`/project/${projectId}/post/${postId}`);
    } catch (error) {
      console.error('오류:', error);
      if (error.response?.status === 403) {
        alert('권한이 없습니다.');
      } else {
        alert('게시글 수정 중 오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <MainContent>
        <ContentContainer>
          <HeaderContainer>
            <BackButton onClick={() => navigate(`/project/${projectId}/post/${postId}`)}>
              <span>←</span>
              뒤로가기
            </BackButton>
            <PageTitle>게시글 수정</PageTitle>
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
              <Label>파일 첨부 (선택사항)</Label>
              <FileInputContainer>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <HiddenFileInput
                    type="file"
                    onChange={handleAddFile}
                    multiple
                    accept={allowedMimeTypes.join(',')}
                    id="fileInput"
                  />
                  <FileButton type="button" onClick={() => document.getElementById('fileInput').click()}>
                    파일 선택
                  </FileButton>
                  <FileSizeGuide>* 파일 크기는 500MB 이하여야 합니다.</FileSizeGuide>
                </div>
                {(existingFiles.length > 0 || newFiles.length > 0) && (
                  <FileLinkDeleter
                    files={[...existingFiles, ...newFiles]}
                    onFileDelete={(index) => {
                      const isExisting = index < existingFiles.length;
                      handleFileDelete(index, isExisting);
                    }}
                  />
                )}
              </FileInputContainer>
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
                </LinkInputGroup>
                <AddButton
                  type="button"
                  onClick={handleAddLink}
                  disabled={!linkTitle || !linkUrl}
                >
                  추가
                </AddButton>
              </LinkInputContainer>
              
              {(existingLinks.length > 0 || newLinks.length > 0) && (
                <FileLinkDeleter
                  links={[...existingLinks, ...newLinks]}
                  onLinkDelete={(index) => {
                    const isExisting = index < existingLinks.length;
                    handleLinkDelete(index, isExisting);
                  }}
                />
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


const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  & > div {
    margin-bottom: 8px;
  }
`;

const FileSizeGuide = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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

const AddButton = styled(Button)`
  background-color: #2E7D32;
  border: none;
  color: white;
  padding: 16px 20px;  // Increased vertical padding
  margin-top: 2px;
  height: 65px;        // Added fixed height
  
  &:hover {
    background-color: #1B5E20;
  }
  
  &:disabled {
    background-color: #e2e8f0;
    cursor: not-allowed;
  }
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 8px 16px;
  margin: 8px 0 0 0;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const LinkItem = styled.li`
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
  padding: 8px 16px;
  background-color: #2E7D32;   // 시그니처 초록색
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1B5E20; // 더 진한 초록색
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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