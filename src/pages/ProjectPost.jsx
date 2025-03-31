import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ProjectPost = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체 게시글');

  const handleCreatePost = () => {
    // Navigate to post creation page
    console.log('Create new post');
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo src="/logo.svg" alt="Logo" />
        <SidebarCreateButton onClick={() => navigate('/projectCreate')}>
          + 프로젝트 생성
        </SidebarCreateButton>
        <MenuList>
          <MenuItem>진행중인 프로젝트</MenuItem>
          <MenuItem active>
            할 일 목록
            <Badge>신규</Badge>
          </MenuItem>
          <MenuItem>모바일 앱 개발</MenuItem>
          <MenuItem>완료된 프로젝트</MenuItem>
          <MenuItem>
            마케팅 사이트 개발
            <SubText>2024.02.10</SubText>
          </MenuItem>
        </MenuList>
      </Sidebar>

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
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #fff;
  border-right: 1px solid #eee;
  padding: 20px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin-bottom: 30px;
`;

const SidebarCreateButton = styled.button`
  width: 100%;
  background-color: #000;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #333;
  }
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MenuItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  ${props => props.active && `
    background: #f5f5f5;
    font-weight: bold;
  `}
`;

const Badge = styled.span`
  background: #FF4444;
  color: white;
  padding: ${props => props.small ? '1px 4px' : '2px 6px'};
  border-radius: 10px;
  font-size: ${props => props.small ? '10px' : '12px'};
  margin-left: 8px;
`;

const SubText = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const MainContent = styled.div`
  flex: 1;
  background: #f9f9f9;
  padding: 20px;
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