import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
// Sidebar를 Navbar로 변경
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

// Change component name from ProjectCreate2 to ProjectCreate
const ProjectCreate = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  
  // Form data
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClientCompany, setSelectedClientCompany] = useState('');
  const [selectedDevCompany, setSelectedDevCompany] = useState('');
  
  // Add date change handlers
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && newStartDate > endDate) {
      alert('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setStartDate(newStartDate);
  };
  
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && newEndDate < startDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }
    setEndDate(newEndDate);
  };
  
  // Selected users
  const [clientManagers, setClientManagers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [devManagers, setDevManagers] = useState([]);
  const [devUsers, setDevUsers] = useState([]);

  // Add these two state variables
  const [clientCompanyUsers, setClientCompanyUsers] = useState([]);
  const [devCompanyUsers, setDevCompanyUsers] = useState([]);

  // Mock data
  // Replace mock companies state with empty array
  const [companies, setCompanies] = useState([]);
  
  // Add useEffect to fetch companies when component mounts
  // Add token to fetch requests
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
          const data = response.data || [];  // response.data가 없으면 빈 배열 사용
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
      
      // Reset selections when company changes
      setClientManagers([]);
      setClientUsers([]);
    }
  }, [selectedClientCompany]);

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
      
      // Reset selections when company changes
      setDevManagers([]);
      setDevUsers([]);
    }
  }, [selectedDevCompany]);

  // 개발사 다중 선택을 위한 상태 수정
  const [devCompanySelections, setDevCompanySelections] = useState([
    { id: 1, companyId: '', managers: [], users: [], companyUsers: [] }
  ]);

  // 개발사 추가 함수 수정
  const handleAddDevCompany = () => {
    setDevCompanySelections([
      ...devCompanySelections,
      {
        id: devCompanySelections.length + 1,
        companyId: '',
        managers: [],
        users: [],
        companyUsers: []
      }
    ]);
  };

  // 개발사 제거 함수 수정
  const handleRemoveDevCompany = (selectionId) => {
    if (devCompanySelections.length === 1) {
      alert('최소 한 개의 개발사는 필요합니다.');
      return;
    }
    setDevCompanySelections(devCompanySelections.filter(selection => selection.id !== selectionId));
  };

  // 개발사 선택 핸들러
  const handleDevCompanyChange = async (selectionId, companyId) => {
    // 이미 선택된 개발사인지 확인
    const isAlreadySelected = devCompanySelections.some(
      selection => selection.id !== selectionId && selection.companyId === companyId
    );

    if (isAlreadySelected) {
      alert('이미 선택된 개발사입니다.');
      return;
    }

    // 사용자 정보 가져오기
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(companyId), {
        headers: {
          'Authorization': token
        }
      });
      const result = await response.json();
      
      if (result.statusCode === 200) {
        const employeeData = result.data.map(employee => ({
          userId: employee.id,
          name: employee.name,
          email: employee.email,
          companyName: employee.companyName
        }));

        setDevCompanySelections(prev => prev.map(selection => 
          selection.id === selectionId
            ? { ...selection, companyId, companyUsers: employeeData, managers: [], users: [] }
            : selection
        ));
      }
    } catch (error) {
      console.error('Error fetching dev company users:', error);
    }
  };

  // 개발사 사용자 선택 핸들러 수정
  const handleDevUserSelection = (selectionId, userId, role, isSelected) => {
    const userIdInt = parseInt(userId);
    
    setDevCompanySelections(prev => prev.map(selection => {
      if (selection.id !== selectionId) return selection;
      
      if (role === 'devManager') {
        return {
          ...selection,
          managers: isSelected 
            ? [...selection.managers, { userId: userIdInt }]
            : selection.managers.filter(item => item.userId !== userIdInt)
        };
      } else {
        return {
          ...selection,
          users: isSelected
            ? [...selection.users, { userId: userIdInt }]
            : selection.users.filter(item => item.userId !== userIdInt)
        };
      }
    }));
  };

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

  // 제출 핸들러 수정
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }
    
    if (!description.trim()) {
      alert('프로젝트 설명을 입력해주세요.');
      return;
    }

    // 모든 개발사가 선택되었는지 확인
    if (devCompanySelections.some(selection => !selection.companyId)) {
      alert('모든 개발사를 선택해주세요.');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    // 모든 개발사의 담당자와 개발자 정보를 하나의 배열로 합치기
    const allDevManagers = devCompanySelections.flatMap(selection => selection.managers);
    const allDevUsers = devCompanySelections.flatMap(selection => selection.users);
    
    const projectData = {
      name: projectName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      clientManagers: clientManagers,
      clientUsers: clientUsers,
      devManagers: allDevManagers,
      devUsers: allDevUsers
    };
    
    console.log('Project data to be sent to server:', projectData);
    
    // Send POST request to the API
    fetch(API_ENDPOINTS.PROJECTS, {
      method: 'POST',
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
      alert('프로젝트 생성 중 오류가 발생했습니다: ' + error.message);
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
          <PageTitle>프로젝트 생성</PageTitle>
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
                  onChange={handleStartDateChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>종료일</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={handleEndDateChange}
                  min={startDate} // Add min attribute
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
                              disabled={clientUsers.some(item => item.userId === user.userId)}
                            />
                            <CheckboxLabel 
                              htmlFor={`client-manager-${user.userId}`}
                              style={{ 
                                color: clientUsers.some(item => item.userId === user.userId) ? '#94a3b8' : '#1e293b' 
                              }}
                            >
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
                              disabled={clientManagers.some(item => item.userId === user.userId)}
                            />
                            <CheckboxLabel 
                              htmlFor={`client-user-${user.userId}`}
                              style={{ 
                                color: clientManagers.some(item => item.userId === user.userId) ? '#94a3b8' : '#1e293b' 
                              }}
                            >
                              {user.name}
                            </CheckboxLabel>
                          </UserCheckboxItem>
                        ))}
                      </UserSelectionContainer>
                    </FormGroup>
                  </>
                )}

            <SectionDivider>개발사 정보</SectionDivider>

            {devCompanySelections.map((selection, index) => (
              <FormGroup key={selection.id}>
                <FormRow>
                  <Select 
                    value={selection.companyId} 
                    onChange={(e) => handleDevCompanyChange(selection.id, e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">개발사 선택</option>
                    {companies
                      .filter(company => 
                        company.companyRole === 'DEVELOPER' && 
                        (!company.id || 
                          company.id === selection.companyId || 
                          !devCompanySelections.some(s => s.companyId === company.id))
                      )
                      .map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))
                    }
                  </Select>
                  {devCompanySelections.length > 1 && (
                    <RemoveButton 
                      type="button" 
                      onClick={() => handleRemoveDevCompany(selection.id)}
                    >
                      삭제
                    </RemoveButton>
                  )}
                </FormRow>

                {selection.companyId && (
                  <>
                    <FormGroup>
                      <Label>개발 담당자</Label>
                      <UserSelectionContainer>
                        {selection.companyUsers.map(user => (
                          <UserCheckboxItem key={`dev-manager-${selection.id}-${user.userId}`}>
                            <Checkbox 
                              type="checkbox"
                              id={`dev-manager-${selection.id}-${user.userId}`}
                              checked={selection.managers.some(item => item.userId === user.userId)}
                              onChange={(e) => handleDevUserSelection(
                                selection.id,
                                user.userId,
                                'devManager',
                                e.target.checked
                              )}
                              disabled={selection.users.some(item => item.userId === user.userId)}
                            />
                            <CheckboxLabel 
                              htmlFor={`dev-manager-${selection.id}-${user.userId}`}
                              style={{ 
                                color: selection.users.some(item => item.userId === user.userId) 
                                  ? '#94a3b8' 
                                  : '#1e293b' 
                              }}
                            >
                              {user.name}
                            </CheckboxLabel>
                          </UserCheckboxItem>
                        ))}
                      </UserSelectionContainer>
                    </FormGroup>

                    <FormGroup>
                      <Label>개발자</Label>
                      <UserSelectionContainer>
                        {selection.companyUsers.map(user => (
                          <UserCheckboxItem key={`dev-user-${selection.id}-${user.userId}`}>
                            <Checkbox 
                              type="checkbox"
                              id={`dev-user-${selection.id}-${user.userId}`}
                              checked={selection.users.some(item => item.userId === user.userId)}
                              onChange={(e) => handleDevUserSelection(
                                selection.id,
                                user.userId,
                                'devUser',
                                e.target.checked
                              )}
                              disabled={selection.managers.some(item => item.userId === user.userId)}
                            />
                            <CheckboxLabel 
                              htmlFor={`dev-user-${selection.id}-${user.userId}`}
                              style={{ 
                                color: selection.managers.some(item => item.userId === user.userId) 
                                  ? '#94a3b8' 
                                  : '#1e293b' 
                              }}
                            >
                              {user.name}
                            </CheckboxLabel>
                          </UserCheckboxItem>
                        ))}
                      </UserSelectionContainer>
                    </FormGroup>
                  </>
                )}
              </FormGroup>
            ))}

            <AddDevCompanyButton type="button" onClick={handleAddDevCompany}>
              + 개발사 추가
            </AddDevCompanyButton>

            <ButtonGroup>
              <CancelButton type="button" onClick={() => navigate('/dashboard')}>취소</CancelButton>
              <SubmitButton type="submit">프로젝트 생성</SubmitButton>
            </ButtonGroup>
          </Form>
        </FormSection>
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
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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

// Add these styled components after your existing styled components
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

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
`;

// SectionDivider 컴포넌트 추가
const SectionDivider = styled.div`
  height: 1px;
  background-color: #e2e8f0;
  margin: 24px 0;
  width: 100%;
`;

// Add these new styled components
const DevCompanySection = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
`;

const DevCompanyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DevCompanyTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AddDevCompanyButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: #2E7D32;
  border: 1px dashed #2E7D32;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  
  &:hover {
    background: #f0fdf4;
  }
`;

const RemoveButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 8px;
  
  &:hover {
    background: #fee2e2;
  }
`;

export default ProjectCreate;