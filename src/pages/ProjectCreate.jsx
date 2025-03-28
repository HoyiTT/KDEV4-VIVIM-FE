import React, { useState } from 'react';
import styled from 'styled-components';

const ProjectCreate = () => {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Project created:', { projectName, startDate, endDate, description, goal });
    // Add API call to create project
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo src="/logo.svg" alt="Logo" />
        <SidebarCreateButton>
          + 프로젝트 생성
        </SidebarCreateButton>
        <MenuList>
          <MenuItem>진행중인 프로젝트</MenuItem>
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
            <Tab active>프로젝트</Tab>
            <Tab>일정관리</Tab>
            <Tab>설정</Tab>
          </TabContainer>
          <UserInfo>
            <UserName>김민수</UserName>
            <UserRole>팀 리더</UserRole>
          </UserInfo>
        </Header>

        <FormSection>
          <SectionTitle>프로젝트 생성</SectionTitle>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>프로젝트 이름</Label>
              <Input 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="프로젝트 이름을 입력하세요"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>개발시 시작</Label>
                <Select>
                  <option>개발시 선택</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>개발시 완료일</Label>
                <Select>
                  <option>날짜를 선택</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>고객사</Label>
                <Select>
                  <option>고객사 선택</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>고객사 담당자</Label>
                <Select>
                  <option>담당자 선택</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>프로젝트 사업명</Label>
              <TextArea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="-/-"
              />
            </FormGroup>

            <FormGroup>
              <Label>프로젝트 목표물</Label>
              <TextArea 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                placeholder="-/-"
              />
            </FormGroup>

            <ButtonGroup>
              <CancelButton type="button">취소</CancelButton>
              <SubmitButton type="submit">프로젝트 생성</SubmitButton>
            </ButtonGroup>
          </Form>
        </FormSection>
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

const FormSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #e5e5e5;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #000;
  color: white;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #333;
  }
`;

export default ProjectCreate;