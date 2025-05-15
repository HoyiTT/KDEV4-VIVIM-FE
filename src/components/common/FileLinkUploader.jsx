import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ActionBadge } from './Badge';

const FileLinkUploader = ({ onFilesChange, onLinksChange, initialFiles = [], initialLinks = [] }) => {
  const [files, setFiles] = useState(initialFiles);
  const [links, setLinks] = useState(initialLinks);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkUrlError, setLinkUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [deletedLinks, setDeletedLinks] = useState([]);

  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    'application/pdf', 'application/rtf', 'text/plain', 'text/rtf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
    'application/json', 'application/xml', 'text/html', 'text/css', 'application/javascript'
  ];

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const handleFileDelete = (indexToDelete) => {
    const deletedFile = files[indexToDelete];
    const newFiles = files.filter((_, index) => index !== indexToDelete);
    setFiles(newFiles);
    setDeletedFiles(prev => [...prev, deletedFile]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      alert('500MB 이상의 파일은 업로드할 수 없습니다:\n' + 
        oversizedFiles.map(file => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`).join('\n'));
      e.target.value = '';
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    setDeletedFiles([]);
  };

  const isValidUrl = (url) => {
    if (!url) return true; // 빈 URL은 유효한 것으로 처리 (에러 메시지 표시 안함)
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleAddLink = () => {
    if (!linkTitle || !linkUrl) {
      if (!linkTitle) {
        alert('링크 제목을 입력해주세요.');
        return;
      }
      if (!linkUrl) {
        alert('링크 URL을 입력해주세요.');
        return;
      }
      return;
    }

    if (!isValidUrl(linkUrl)) {
      setLinkUrlError('URL은 http:// 또는 https://로 시작해야 합니다.');
      return;
    }

    try {
      // URL 유효성 검사
      new URL(linkUrl);
      
      const newLink = { title: linkTitle, url: linkUrl };
      const newLinks = [...links, newLink];
      
      console.log('▶ 링크 추가 시도:', { newLink, currentLinks: newLinks });
      
      setLinks(newLinks);
      onLinksChange(newLinks);  // 단순히 링크 배열만 전달
      
      // 입력 필드 초기화
      setLinkTitle('');
      setLinkUrl('');
      setLinkUrlError('');
      
      console.log('▶ 링크 추가 완료:', { newLinks });
    } catch (error) {
      console.error('▶ 링크 추가 실패:', error);
      setLinkUrlError('올바른 URL 형식이 아닙니다.');
    }
  };

  const handleLinkDelete = (indexToDelete) => {
    const deletedLink = links[indexToDelete];
    const newLinks = links.filter((_, index) => index !== indexToDelete);
    setLinks(newLinks);
    setDeletedLinks(prev => [...prev, deletedLink]);
  };

  useEffect(() => {
    if (links.length > 0 || deletedLinks.length > 0) {
      console.log('▶ 링크 상태 변경:', { links, deletedLinks });
      onLinksChange(links);  // 단순히 링크 배열만 전달
    }
  }, [links, deletedLinks, onLinksChange]);

  useEffect(() => {
    onFilesChange?.({
      currentFiles: files,
      deletedFiles: deletedFiles
    });
  }, [files, deletedFiles, onFilesChange]);

  return (
    <>
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
                    setLinkUrlError('URL은 http:// 또는 https://로 시작해야 합니다.');
                  } else {
                    setLinkUrlError('');
                  }
                }
              }}
              placeholder="URL을 입력하세요 (http:// 또는 https://로 시작)"
              maxLength={1000}
            />
            <InputFooter>
              {linkUrlError ? (
                <ErrorMessage>{linkUrlError}</ErrorMessage>
              ) : (
                <div style={{ flex: 1 }} />
              )}
              <CharacterCount>
                {linkUrl.length}/1000
              </CharacterCount>
            </InputFooter>
          </LinkInputGroup>
          {(linkTitle || linkUrl) && (
            <ActionBadge
              type="success"
              size="large"
              onClick={handleAddLink}
              disabled={!linkTitle || !linkUrl}
              style={{ minWidth: '100px', height: '65px' }}
            >
              추가
            </ActionBadge>
          )}
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
    </>
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

const ErrorMessage = styled.div`
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
  flex: 1;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

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
  font-size: 14px;
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

const CharacterCount = styled.span`
  font-size: 12px;
  color: ${props => props.theme.isNearLimit ? '#ef4444' : '#64748b'};
  text-align: right;
  margin-top: 4px;
`;

const InputFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  gap: 8px;
`;

export default FileLinkUploader; 