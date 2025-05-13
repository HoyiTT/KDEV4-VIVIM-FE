import React from 'react';
import styled from 'styled-components';

const FileLinkDeleter = ({ 
  files = [], 
  links = [], 
  onFileDelete = () => {}, 
  onLinkDelete = () => {} 
}) => {
  const hasFiles = Array.isArray(files) && files.length > 0;
  const hasLinks = Array.isArray(links) && links.length > 0;

  if (!hasFiles && !hasLinks) {
    return null;
  }

  return (
    <Container>
      {hasFiles && (
        <Section>
          <SectionTitle>첨부 파일</SectionTitle>
          <List>
            {files.map((file, index) => (
              <ListItem key={`file-${index}`}>
                <ItemContent>
                  <FileIcon>📎</FileIcon>
                  <FileName>{file.name}</FileName>
                </ItemContent>
                <DeleteButton onClick={() => onFileDelete(index)}>
                  ✕
                </DeleteButton>
              </ListItem>
            ))}
          </List>
        </Section>
      )}

      {hasLinks && (
        <Section>
          <SectionTitle>첨부 링크</SectionTitle>
          <List>
            {links.map((link, index) => (
              <ListItem key={`link-${index}`}>
                <ItemContent>
                  <LinkIcon>🔗</LinkIcon>
                  <LinkInfo>
                    <LinkTitle>{link.title}</LinkTitle>
                    <LinkUrl>({link.url})</LinkUrl>
                  </LinkInfo>
                </ItemContent>
                <DeleteButton onClick={() => onLinkDelete(index)}>
                  ✕
                </DeleteButton>
              </ListItem>
            ))}
          </List>
        </Section>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionTitle = styled.h4`
  margin: 0;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const List = styled.ul`
  list-style: none;
  padding: 8px 16px;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const FileIcon = styled.span`
  font-size: 16px;
  color: #64748b;
`;

const FileName = styled.span`
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LinkIcon = styled.span`
  font-size: 16px;
  color: #64748b;
`;

const LinkInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const LinkTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LinkUrl = styled.span`
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #fee2e2;
  border: none;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 12px;

  &:hover {
    background: #fecaca;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
  }
`;

export default FileLinkDeleter; 