import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ProjectCreate2 = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  
  // Form data
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClientCompany, setSelectedClientCompany] = useState('');
  const [selectedDevCompany, setSelectedDevCompany] = useState('');
  
  // Selected users
  const [clientManagers, setClientManagers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [devManagers, setDevManagers] = useState([]);
  const [devUsers, setDevUsers] = useState([]);

  // Mock data
  const [companies, setCompanies] = useState([
    { id: 1, name: '가이던테크', type: 'client' },
    { id: 2, name: '신한디지털', type: 'client' },
    { id: 3, name: '미래캐피탈', type: 'client' },
    { id: 4, name: '비엔개발', type: 'dev' },
    { id: 5, name: '테크솔루션', type: 'dev' }
  ]);
  
  const [users, setUsers] = useState([
    { userId: 1, name: '김철수', companyId: 1 },
    { userId: 2, name: '이영희', companyId: 1 },
    { userId: 3, name: '박지민', companyId: 1 },
    { userId: 4, name: '최유리', companyId: 1 },
    { userId: 5, name: '정민준', companyId: 2 },
    { userId: 6, name: '강서연', companyId: 2 },
    { userId: 7, name: '윤도현', companyId: 3 },
    { userId: 8, name: '한지원', companyId: 3 },
    { userId: 9, name: '송태양', companyId: 4 },
    { userId: 10, name: '임하늘', companyId: 4 },
    { userId: 11, name: '오민석', companyId: 4 },
    { userId: 12, name: '신예진', companyId: 5 },
    { userId: 13, name: '권현우', companyId: 5 },
  ]);

  // Filtered users based on selected companies
  const [clientCompanyUsers, setClientCompanyUsers] = useState([]);
  const [devCompanyUsers, setDevCompanyUsers] = useState([]);

  // Update available users when companies are selected
  useEffect(() => {
    if (selectedClientCompany) {
      const companyId = parseInt(selectedClientCompany);
      const filteredUsers = users.filter(user => user.companyId === companyId);
      setClientCompanyUsers(filteredUsers);
      
      // Reset selections when company changes
      setClientManagers([]);
      setClientUsers([]);
    }
  }, [selectedClientCompany, users]);

  useEffect(() => {
    if (selectedDevCompany) {
      const companyId = parseInt(selectedDevCompany);
      const filteredUsers = users.filter(user => user.companyId === companyId);
      setDevCompanyUsers(filteredUsers);
      
      // Reset selections when company changes
      setDevManagers([]);
      setDevUsers([]);
    }
  }, [selectedDevCompany, users]);

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleUserSelection = (userId, role, isSelected) => {
    const userIdInt = parseInt(userId);
    
    switch(role) {
      case 'clientManager':
        if (isSelected) {
          setClientManagers([...clientManagers, { userId: userIdInt }]);
        } else {
          setClientManagers(clientManagers.filter(item => item.userId !== userIdInt));
        }
        break;
      case 'clientUser':
        if (isSelected) {
          setClientUsers([...clientUsers, { userId: userIdInt }]);
        } else {
          setClientUsers(clientUsers.filter(item => item.userId !== userIdInt));
        }
        break;
      case 'devManager':
        if (isSelected) {
          setDevManagers([...devManagers, { userId: userIdInt }]);
        } else {
          setDevManagers(devManagers.filter(item => item.userId !== userIdInt));
        }
        break;
      case 'devUser':
        if (isSelected) {
          setDevUsers([...devUsers, { userId: userIdInt }]);
        } else {
          setDevUsers(devUsers.filter(item => item.userId !== userIdInt));
        }
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create project data object
    const projectData = {
      name: projectName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      clientManagers: clientManagers,
      clientUsers: clientUsers,
      devManagers: devManagers,
      devUsers: devUsers
    };
    
    console.log('Project data to be sent to server:', projectData);
    
    // Send POST request to the API
    fetch('http://localhost:8080/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(projectData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.log('Error response body:', text);
          throw new Error(`Server responded with ${response.status}: ${text || 'No error details provided'}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      // Navigate back to dashboard on success
      navigate('/dashboard2');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('프로젝트 생성 중 오류가 발생했습니다: ' + error.message);
    });
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarHeader>
          <Logo src="/logo.svg" alt="Logo" />
          <Title>BN 시스템 프로젝트 관리</Title>
        </SidebarHeader>
        
        <MenuList>
          <MenuItem 
            active={activeMenuItem === '대시보드'} 
            onClick={() => handleMenuClick('대시보드')}
          >
            대시보드
          </MenuItem>
          <MenuItem 
            active={activeMenuItem === '진행중인 프로젝트'} 
            onClick={() => handleMenuClick('진행중인 프로젝트')}
          >
            진행중인 프로젝트
          </MenuItem>
          <MenuItem 
            active={activeMenuItem === '완료된 프로젝트'} 
            onClick={() => handleMenuClick('완료된 프로젝트')}
          >
            완료된 프로젝트
          </MenuItem>
          <MenuItem 
            active={activeMenuItem === '리소스 관리'} 
            onClick={() => handleMenuClick('리소스 관리')}
          >
            리소스 관리
          </MenuItem>
          <MenuItem 
            active={activeMenuItem === '고객사 관리'} 
            onClick={() => handleMenuClick('고객사 관리')}
          >
            고객사 관리
          </MenuItem>
          <MenuItem 
            active={activeMenuItem === '통계 및 보고서'} 
            onClick={() => handleMenuClick('통계 및 보고서')}
          >
            통계 및 보고서
          </MenuItem>
        </MenuList>
      </Sidebar>

      <MainContent>
        <Header>
          <PageTitle>프로젝트 생성</PageTitle>
          <ProfileContainer>
            <ProfileImage src="https://via.placeholder.com/40" alt="Profile" />
          </ProfileContainer>
        </Header>

        <FormSection>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>프로젝트 이름</Label>
              <Input 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="프로젝트 이름을 입력하세요"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>프로젝트 설명</Label>
              <TextArea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="프로젝트 설명을 입력하세요"
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>시작일</Label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>종료일</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </FormGroup>
            </FormRow>

            <SectionDivider>고객사 정보</SectionDivider>

            <FormGroup>
              <Label>고객사</Label>
              <Select 
                value={selectedClientCompany} 
                onChange={(e) => setSelectedClientCompany(e.target.value)}
                required
              >
                <option value="">고객사 선택</option>
                {companies
                  .filter(company => company.type === 'client')
                  .map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))
                }
              </Select>
            </FormGroup>

            {selectedClientCompany && (
              <>
                <FormGroup>
                  <Label>고객사 담당자</Label>
                  <UserSelectionContainer>
                    {clientCompanyUsers.map(user => (
                      <UserCheckboxItem key={`manager-${user.userId}`}>
                        <Checkbox 
                          type="checkbox"
                          id={`client-manager-${user.userId}`}
                          checked={clientManagers.some(item => item.userId === user.userId)}
                          onChange={(e) => handleUserSelection(user.userId, 'clientManager', e.target.checked)}
                        />
                        <CheckboxLabel htmlFor={`client-manager-${user.userId}`}>
                          {user.name}
                        </CheckboxLabel>
                      </UserCheckboxItem>
                    ))}
                  </UserSelectionContainer>
                </FormGroup>

                <FormGroup>
                  <Label>고객사 일반 사용자</Label>
                  <UserSelectionContainer>
                    {clientCompanyUsers.map(user => (
                      <UserCheckboxItem key={`user-${user.userId}`}>
                        <Checkbox 
                          type="checkbox"
                          id={`client-user-${user.userId}`}
                          checked={clientUsers.some(item => item.userId === user.userId)}
                          onChange={(e) => handleUserSelection(user.userId, 'clientUser', e.target.checked)}
                        />
                        <CheckboxLabel htmlFor={`client-user-${user.userId}`}>
                          {user.name}
                        </CheckboxLabel>
                      </UserCheckboxItem>
                    ))}
                  </UserSelectionContainer>
                </FormGroup>
              </>
            )}

            <SectionDivider>개발사 정보</SectionDivider>

            <FormGroup>
              <Label>개발사</Label>
              <Select 
                value={selectedDevCompany} 
                onChange={(e) => setSelectedDevCompany(e.target.value)}
                required
              >
                <option value="">개발사 선택</option>
                {companies
                  .filter(company => company.type === 'dev')
                  .map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))
                }
              </Select>
            </FormGroup>

            {selectedDevCompany && (
              <>
                <FormGroup>
                  <Label>개발 담당자</Label>
                  <UserSelectionContainer>
                    {devCompanyUsers.map(user => (
                      <UserCheckboxItem key={`dev-manager-${user.userId}`}>
                        <Checkbox 
                          type="checkbox"
                          id={`dev-manager-${user.userId}`}
                          checked={devManagers.some(item => item.userId === user.userId)}
                          onChange={(e) => handleUserSelection(user.userId, 'devManager', e.target.checked)}
                        />
                        <CheckboxLabel htmlFor={`dev-manager-${user.userId}`}>
                          {user.name}
                        </CheckboxLabel>
                      </UserCheckboxItem>
                    ))}
                  </UserSelectionContainer>
                </FormGroup>

                <FormGroup>
                  <Label>개발자</Label>
                  <UserSelectionContainer>
                    {devCompanyUsers.map(user => (
                      <UserCheckboxItem key={`dev-user-${user.userId}`}>
                        <Checkbox 
                          type="checkbox"
                          id={`dev-user-${user.userId}`}
                          checked={devUsers.some(item => item.userId === user.userId)}
                          onChange={(e) => handleUserSelection(user.userId, 'devUser', e.target.checked)}
                        />
                        <CheckboxLabel htmlFor={`dev-user-${user.userId}`}>
                          {user.name}
                        </CheckboxLabel>
                      </UserCheckboxItem>
                    ))}
                  </UserSelectionContainer>
                </FormGroup>
              </>
            )}

            <ButtonGroup>
              <CancelButton type="button" onClick={() => navigate('/dashboard2')}>취소</CancelButton>
              <SubmitButton type="submit">프로젝트 생성</SubmitButton>
            </ButtonGroup>
          </Form>
        </FormSection>
      </MainContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 0 24px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #4F6AFF;
  margin: 0;
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
`;

const MenuItem = styled.div`
  padding: 12px;
  margin: 4px 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.active ? '#4F6AFF' : '#64748b'};
  background: ${props => props.active ? 'rgba(79, 106, 255, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(79, 106, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

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

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4F6AFF;
    box-shadow: 0 0 0 3px rgba(79, 106, 255, 0.1);
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4F6AFF;
    box-shadow: 0 0 0 3px rgba(79, 106, 255, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4F6AFF;
    box-shadow: 0 0 0 3px rgba(79, 106, 255, 0.1);
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
`;

const SectionDivider = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #4F6AFF;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
`;

const UserSelectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
`;

const UserCheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4F6AFF;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background-color: #4F6AFF;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #3a54e6;
  }
`;

export default ProjectCreate2;