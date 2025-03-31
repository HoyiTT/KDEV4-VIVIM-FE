import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Change component name from Dashboard2 to Dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <DashboardContainer>
      <Sidebar 
        activeMenuItem={activeMenuItem} 
        handleMenuClick={handleMenuClick} 
      />

      <MainContent>
        {/* 나머지 대시보드 내용은 그대로 유지 */}
        <Header>
          <SearchContainer>
            <SearchInput placeholder="프로젝트 검색" />
            <SearchButton>검색</SearchButton>
          </SearchContainer>
          <ProfileContainer>
            <CreateButton onClick={() => navigate('/projectCreate')}>
              프로젝트 생성
            </CreateButton>
            <ProfileImage src="https://via.placeholder.com/40" alt="Profile" />
          </ProfileContainer>
        </Header>

        <StatsContainer>
          <StatCard>
            <StatTitle>전체 프로젝트</StatTitle>
            <StatValue>42</StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>진행중</StatTitle>
            <StatValue primary>18</StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>고객 승인 대기</StatTitle>
            <StatValue warning>7</StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>오늘 마감</StatTitle>
            <StatValue danger>3</StatValue>
          </StatCard>
        </StatsContainer>

        <ProjectSection>
          <SectionHeader>
            <SectionTitle>진행중인 프로젝트</SectionTitle>
            <FilterContainer>
              <FilterLabel>필터:</FilterLabel>
              <FilterButton active>모든 상태</FilterButton>
              <FilterButton>최신순</FilterButton>
            </FilterContainer>
          </SectionHeader>

          <ProjectTable>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>프로젝트명</TableHeaderCell>
                <TableHeaderCell>고객사</TableHeaderCell>
                <TableHeaderCell>단계</TableHeaderCell>
                <TableHeaderCell>진행상태</TableHeaderCell>
                <TableHeaderCell>마감일</TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>웹사이트 리뉴얼</TableCell>
                <TableCell>가이던테크</TableCell>
                <TableCell>
                  <StatusBadge color="#4F6AFF">디자인</StatusBadge>
                </TableCell>
                <TableCell>
                  <ProgressBadge color="#4F6AFF">진행중</ProgressBadge>
                </TableCell>
                <TableCell>2025.04.15</TableCell>
                <TableCell>
                  <ActionButton>보기</ActionButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>API 연동 개발</TableCell>
                <TableCell>신한디지털</TableCell>
                <TableCell>
                  <StatusBadge color="#4F6AFF">개발</StatusBadge>
                </TableCell>
                <TableCell>
                  <ProgressBadge color="#FF9F1C">승인대기</ProgressBadge>
                </TableCell>
                <TableCell>2025.03.30</TableCell>
                <TableCell>
                  <ActionButton>보기</ActionButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>모바일 앱 개발</TableCell>
                <TableCell>미래캐피탈</TableCell>
                <TableCell>
                  <StatusBadge color="#4F6AFF">테스트</StatusBadge>
                </TableCell>
                <TableCell>
                  <ProgressBadge color="#FF5A5A">마감임박</ProgressBadge>
                </TableCell>
                <TableCell>2025.03.21</TableCell>
                <TableCell>
                  <ActionButton>보기</ActionButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </ProjectTable>
        </ProjectSection>

        <ActivitySection>
          <SectionTitle>최근 활동 및 알림</SectionTitle>
          <ActivityList>
            <ActivityItem>
              <ActivityIcon color="#4F6AFF" />
              <ActivityContent>
                <ActivityText>가이던테크 디자인 시안 승인 완료</ActivityText>
                <ActivityTime>오늘 10:23</ActivityTime>
              </ActivityContent>
            </ActivityItem>
            <ActivityItem>
              <ActivityIcon color="#FF9F1C" />
              <ActivityContent>
                <ActivityText>신한디지털에서 API 연동 요구사항 체크리스트 제출</ActivityText>
                <ActivityTime>어제 16:45</ActivityTime>
              </ActivityContent>
            </ActivityItem>
            <ActivityItem>
              <ActivityIcon color="#FF5A5A" />
              <ActivityContent>
                <ActivityText>미래캐피탈 테스트 피드백 수정 필요</ActivityText>
                <ActivityTime>2일 전</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          </ActivityList>
        </ActivitySection>
      </MainContent>
    </DashboardContainer>
  );
};

// Add this styled component
const CreateButton = styled.button`
  padding: 12px 24px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1B5E20;
  }
`;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

// Sidebar styled component 제거 (import된 컴포넌트로 대체)

// 아래 SidebarHeader, Logo, Title, MenuList, MenuItem 컴포넌트들도 제거
// 이 컴포넌트들은 이제 Sidebar.jsx 파일에 있음

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4F6AFF;
  }
`;

const SearchButton = styled.button`
  padding: 12px 20px;
  background: #4F6AFF;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a54e6;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;



const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
`;

const StatTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${props => {
    if (props.primary) return '#4F6AFF';
    if (props.warning) return '#FF9F1C';
    if (props.danger) return '#FF5A5A';
    return '#1e293b';
  }};
`;

const ProjectSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const FilterButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.active ? '#4F6AFF' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: 1px solid ${props => props.active ? '#4F6AFF' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#3a54e6' : '#f8fafc'};
  }
`;

const ProjectTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  background: ${props => `${props.color}15`};
  color: ${props => props.color};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const ProgressBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  background: ${props => `${props.color}15`};
  color: ${props => props.color};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #4F6AFF;
  border: 1px solid #4F6AFF;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4F6AFF;
    color: white;
  }
`;

const ActivitySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const ActivityList = styled.div`
  margin-top: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
  margin-top: 6px;
  margin-right: 12px;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

export default Dashboard;