import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const ProjectModify = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get project ID from URL
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

  // Project users from API
  const [projectUsers, setProjectUsers] = useState([]);

  // Company users
  const [clientCompanyUsers, setClientCompanyUsers] = useState([]);
  const [devCompanyUsers, setDevCompanyUsers] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Companies data
  const [companies, setCompanies] = useState([]);
  
  // Fetch companies
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(API_ENDPOINTS.COMPANIES, {
      headers: {
        'Authorization': token
      }
    })
      .then(response => response.json())
      .then(data => {
        setCompanies(data);
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
      });
  }, []);

  // Fetch project data
  useEffect(() => {
    if (projectId) {
      const token = localStorage.getItem('token');
      fetch(API_ENDPOINTS.PROJECT_DETAIL(projectId), {
        headers: {
          'Authorization': token
        }
      })
        .then(response => response.json())
        .then(data => {
          // Populate form with project data
          setProjectName(data.name);
          setDescription(data.description);
          setStartDate(data.startDate);
          setEndDate(data.endDate);
          setSelectedClientCompany(data.clientCompanyId);
          setSelectedDevCompany(data.devCompanyId);
          
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching project:', error);
          setLoading(false);
        });
    }
  }, [projectId]);

  // Fetch project users
  useEffect(() => {
    if (projectId) {
      const token = localStorage.getItem('token');
      fetch(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/users`, {
        headers: {
          'Authorization': token
        }
      })
        .then(response => response.json())
        .then(data => {
          setProjectUsers(data);
          
          // Organize users by role
          const clientManagersList = [];
          const clientUsersList = [];
          const devManagersList = [];
          const devUsersList = [];
          
          data.forEach(user => {
            const userObj = { userId: user.userId };
            
            switch(user.role) {
              case 'CLIENT_MANAGER':
                clientManagersList.push(userObj);
                break;
              case 'CLIENT_USER':
                clientUsersList.push(userObj);
                break;
              case 'DEVELOPER_MANAGER':
                devManagersList.push(userObj);
                break;
              case 'DEVELOPER_USER':
                devUsersList.push(userObj);
                break;
              default:
                break;
            }
          });
          
          setClientManagers(clientManagersList);
          setClientUsers(clientUsersList);
          setDevManagers(devManagersList);
          setDevUsers(devUsersList);
        })
        .catch(error => {
          console.error('Error fetching project users:', error);
        });
    }
  }, [projectId]);

  // Fetch client company users
  useEffect(() => {
    if (selectedClientCompany) {
      const token = localStorage.getItem('token');
      fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(selectedClientCompany), {
        headers: {
          'Authorization': token
        }
      })
        .then(response => response.json())
        .then(response => {
          const data = response.data || [];
          const employeeData = data.map(employee => ({
            userId: employee.id,
            name: employee.name,
            email: employee.email,
            companyName: employee.companyName
          }));
          setClientCompanyUsers(employeeData);
        })
        .catch(error => {
          console.error('Error fetching client company users:', error);
        });
    }
  }, [selectedClientCompany]);

  // Fetch dev company users
  useEffect(() => {
    if (selectedDevCompany) {
      const token = localStorage.getItem('token');
      fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(selectedDevCompany), {
        headers: {
          'Authorization': token
        }
      })
        .then(response => response.json())
        .then(result => {
          if (result.statusCode === 200) {
            const employeeData = result.data.map(employee => ({
              userId: employee.id,
              name: employee.name,
              email: employee.email,
              companyName: employee.companyName
            }));
            setDevCompanyUsers(employeeData);
          }
        })
        .catch(error => {
          console.error('Error fetching dev company users:', error);
        });
    }
  }, [selectedDevCompany]);

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
    const token = localStorage.getItem('token');
    
    // Create project data object with proper role values
    const projectData = {
      name: projectName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      clientManagers: clientManagers.map(manager => ({
        userId: manager.userId,
        role: "CLIENT_MANAGER"
      })),
      clientUsers: clientUsers.map(user => ({
        userId: user.userId,
        role: "CLIENT_USER"
      })),
      devManagers: devManagers.map(manager => ({
        userId: manager.userId,
        role: "DEVELOPER_MANAGER"
      })),
      devUsers: devUsers.map(user => ({
        userId: user.userId,
        role: "DEVELOPER_USER"
      }))
    };
    
    console.log('Project data to be sent to server:', projectData);
    
    // Send PUT request to update the project
    fetch(API_ENDPOINTS.PROJECT_DETAIL(projectId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token
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
      navigate('/dashboard');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('프로젝트 수정 중 오류가 발생했습니다: ' + error.message);
    });
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem} 
        handleMenuClick={handleMenuClick} 
      />
      <MainContent>
        <Header>
          <PageTitle>프로젝트 수정</PageTitle>

        </Header>

        {loading ? (
          <LoadingContainer>
            <LoadingMessage>프로젝트 정보를 불러오는 중...</LoadingMessage>
          </LoadingContainer>
        ) : (
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
                    .filter(company => company.companyRole === 'CUSTOMER')
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
                    .filter(company => company.companyRole === 'DEVELOPER')
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
                <CancelButton type="button" onClick={() => navigate('/dashboard')}>취소</CancelButton>
                <SubmitButton type="submit">프로젝트 수정</SubmitButton>
              </ButtonGroup>
            </Form>
          </FormSection>
        )}
      </MainContent>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
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
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
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
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
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
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
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
  background-color: #2E7D32;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #1B5E20;
  }
`;

const UserSelectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const UserCheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2E7D32;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
`;

const SectionDivider = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const LoadingMessage = styled.div`
  font-size: 16px;
  color: #64748b;
`;

export default ProjectModify;