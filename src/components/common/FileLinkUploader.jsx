import React, { useState } from 'react';
import styled from 'styled-components';

const FileLinkUploader = ({ onFilesChange, onLinksChange, initialFiles = [], initialLinks = [] }) => {
  const [files, setFiles] = useState(initialFiles);
  const [links, setLinks] = useState(initialLinks);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkUrlError, setLinkUrlError] = useState('');
  const [fileError, setFileError] = useState('');

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
    const newFiles = files.filter((_, index) => index !== indexToDelete);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
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
    onFilesChange?.(newFiles);
    e.target.value = '';
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    if (!linkTitle || !linkUrl) {
      return;
    }

    if (!isValidUrl(linkUrl)) {
      setLinkUrlError('올바른 URL 형식이 아닙니다. (예: https://www.example.com)');
      return;
    }

    const newLinks = [...links, { title: linkTitle, url: linkUrl }];
    setLinks(newLinks);
    onLinksChange?.(newLinks);
    setLinkTitle('');
    setLinkUrl('');
    setLinkUrlError('');
  };

  const handleLinkDelete = (indexToDelete) => {
    const newLinks = links.filter((_, index) => index !== indexToDelete);
    setLinks(newLinks);
    onLinksChange?.(newLinks);
  };

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

const CharacterCount = styled.span`
  font-size: 12px;
  color: ${props => props.theme.isNearLimit ? '#ef4444' : '#64748b'};
  text-align: right;
  margin-top: 4px;
`;

export default FileLinkUploader; 