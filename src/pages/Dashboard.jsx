import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('project');
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/projectCreate');
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo src="/logo.svg" alt="Logo" />
        <SidebarCreateButton onClick={handleCreateProject}>
          + 프로젝트 생성
        </SidebarCreateButton>
        <MenuList>
          <MenuItem active>진행중인 프로젝트</MenuItem>
          <MenuItem>
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
            <Tab active={activeTab === 'project'} onClick={() => setActiveTab('project')}>
              프로젝트
            </Tab>
            <Tab active={activeTab === 'management'} onClick={() => setActiveTab('management')}>
              일정관리
            </Tab>
            <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
              설정
            </Tab>
          </TabContainer>
          <UserInfo>
            <UserName>김민수</UserName>
            <UserRole>팀 리더</UserRole>
          </UserInfo>
        </Header>

        <ProjectSection>
          <SectionTitle>프로젝트 단계</SectionTitle>
          <StageContainer>
            <Stage>
              <StageHeader>
                <StageTitle>요구사항 분석</StageTitle>
                <StageCount>3</StageCount>
              </StageHeader>
              <StageItem status="completed">요구사항 분석</StageItem>
            </Stage>
            <Stage>
              <StageHeader>
                <StageTitle>디자인</StageTitle>
                <StageCount>2</StageCount>
              </StageHeader>
              <StageItem status="inProgress">와이어프레임</StageItem>
            </Stage>
            <Stage>
              <StageHeader>
                <StageTitle>개발</StageTitle>
                <StageCount>5</StageCount>
              </StageHeader>
              <StageItem>프론트엔드 개발</StageItem>
            </Stage>
            <Stage>
              <StageHeader>
                <StageTitle>테스트</StageTitle>
                <StageCount>2</StageCount>
              </StageHeader>
              <StageItem>단위 테스트</StageItem>
            </Stage>
          </StageContainer>

          <ScheduleSection>
            <SectionTitle>계시판 최근글</SectionTitle>
            <ScheduleItem>
              <ScheduleTag color="#FFE5E5">공지</ScheduleTag>
              <ScheduleText>3월 첫째 업데이트 안내</ScheduleText>
              <ScheduleDate>2024.02.29</ScheduleDate>
            </ScheduleItem>
            <ScheduleItem>
              <ScheduleTag color="#E5F0FF">일반</ScheduleTag>
              <ScheduleText>API 연동 관련 문의</ScheduleText>
              <ScheduleDate>2024.02.28</ScheduleDate>
            </ScheduleItem>
          </ScheduleSection>
        </ProjectSection>
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
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
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

const ProjectSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
`;

const StageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
`;

const Stage = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StageTitle = styled.div`
  font-weight: bold;
`;

const StageCount = styled.div`
  background: #666;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const StageItem = styled.div`
  background: white;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #eee;
`;

const ScheduleSection = styled.div`
  margin-top: 30px;
`;

const ScheduleItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
`;

const ScheduleTag = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${props => props.color};
  margin-right: 15px;
`;

const ScheduleText = styled.div`
  flex: 1;
`;

const ScheduleDate = styled.div`
  color: #999;
  font-size: 14px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const CreateButton = styled.button`
  background-color: #000;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #333;
  }
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

export default Dashboard;