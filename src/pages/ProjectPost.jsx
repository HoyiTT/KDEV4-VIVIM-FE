import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';

const ProjectPost = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체 게시글');

  const handleCreatePost = () => {
    // Navigate to post creation page
    console.log('Create new post');
  };

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <TabContainer>
            <Tab>프로젝트</Tab>
            <Tab active>일정관리</Tab>
            <Tab>설정</Tab>
          </TabContainer>
          <UserInfo>
            <UserName>김민수</UserName>
            <UserRole>팀 리더</UserRole>
          </UserInfo>
        </Header>

        <PostSection>
          <PostHeader>
            <PostTitle>커뮤니티 게시판</PostTitle>
            <WriteButton onClick={handleCreatePost}>글쓰기</WriteButton>
          </PostHeader>

          <FilterSection>
            <CategorySelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option>전체 게시글</option>
              <option>공지</option>
              <option>일반</option>
            </CategorySelect>
            <SearchBox>
              <SearchInput 
                type="text" 
                placeholder="검색어를 입력하세요" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon>🔍</SearchIcon>
            </SearchBox>
          </FilterSection>

          <PostTable>
            <TableHeader>
              <TableRow>
                <TableHeaderCell width="5%">번호</TableHeaderCell>
                <TableHeaderCell width="50%">제목</TableHeaderCell>
                <TableHeaderCell width="10%">작성자</TableHeaderCell>
                <TableHeaderCell width="15%">날짜</TableHeaderCell>
                <TableHeaderCell width="10%">조회수</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>2024년 3분기 개발자 채용 안내</TableCell>
                <TableCell>김민수</TableCell>
                <TableCell>2024.03.20</TableCell>
                <TableCell>245</TableCell>
              </TableRow>
              <TableRow highlighted>
                <TableCell>2</TableCell>
                <TableCell>새로운 기능 업데이트 <Badge small>공지</Badge></TableCell>
                <TableCell>김민수</TableCell>
                <TableCell>2024.01.19</TableCell>
                <TableCell>189</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>클라이언트-서버 데이터 동기화</TableCell>
                <TableCell>이하린</TableCell>
                <TableCell>2024.02.15</TableCell>
                <TableCell>145</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>서버 배포 이슈에 관해</TableCell>
                <TableCell>이하린</TableCell>
                <TableCell>2024.02.17</TableCell>
                <TableCell>203</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>API키가 만료된 이슈</TableCell>
                <TableCell>박준호</TableCell>
                <TableCell>2024.02.19</TableCell>
                <TableCell>175</TableCell>
              </TableRow>
            </TableBody>
          </PostTable>

          <Pagination>
            <PageButton>&lt;</PageButton>
            <PageButton active>1</PageButton>
            <PageButton>2</PageButton>
            <PageButton>3</PageButton>
            <PageButton>4</PageButton>
            <PageButton>5</PageButton>
            <PageButton>&gt;</PageButton>
          </Pagination>
        </PostSection>
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  ${props => props.active && `
    border-bottom: 2px solid #000;
    font-weight: bold;
  `}
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: bold;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #666;
`;

const PostSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PostTitle = styled.h2`
  font-size: 18px;
  margin: 0;
`;

const WriteButton = styled.button`
  background-color: #000;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #333;
  }
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CategorySelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  padding-right: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const PostTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  border-top: 2px solid #000;
  border-bottom: 1px solid #ddd;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  ${props => props.highlighted && `
    background-color: #f9f9f9;
  `}
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 8px;
  text-align: ${props => props.align || 'center'};
  font-size: 14px;
  font-weight: 500;
  color: #333;
  width: ${props => props.width || 'auto'};
`;

const TableCell = styled.td`
  padding: 12px 8px;
  text-align: ${props => props.align || 'center'};
  font-size: 14px;
  color: #666;
  
  &:nth-child(2) {
    text-align: left;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 5px;
`;

const PageButton = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.active ? '#000' : '#ddd'};
  background-color: ${props => props.active ? '#000' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    border-color: #000;
  }
`;

export default ProjectPost;