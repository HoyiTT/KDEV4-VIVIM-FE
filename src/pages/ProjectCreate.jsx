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
  const [selectedDevCompany, setSelectedDevCompany] = useState(null);
  
  // Add date change handlers
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
  };
  
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
  };

  // 날짜 입력 완료 후 유효성 검사
  const validateDates = () => {
    if (startDate && endDate && startDate > endDate) {
      alert('시작일은 종료일보다 늦을 수 없습니다.');
      return false;
    }
    return true;
  };

  // 시작일 입력 완료 후 유효성 검사
  const handleStartDateBlur = () => {
    if (startDate && endDate && startDate > endDate) {
      alert('시작일은 종료일보다 늦을 수 없습니다.');
      setStartDate('');
    }
  };

  // 종료일 입력 완료 후 유효성 검사
  const handleEndDateBlur = () => {
    if (startDate && endDate && endDate < startDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      setEndDate('');
    }
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
        'Authorization': token,
        'Content-Type': 'application/json'
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
    setDevCompanySelections(prev => prev.filter(selection => selection.id !== selectionId));
  };

  // 개발사 선택 핸들러
  const handleDevCompanySelect = async (company) => {
    console.log('선택된 개발사:', company);
    if (!selectedDevCompany) {
      console.error('선택된 개발사 정보가 없습니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(company.id), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('받은 사용자 데이터:', result);
      
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        const formattedUsers = result.data.map(user => ({
          ...user,
          userId: String(user.id)
        }));
        
        setDevCompanySelections(prev => prev.map(selection => 
          selection.id === selectedDevCompany.id
            ? { ...selection, companyId: company.id, companyUsers: formattedUsers }
            : selection
        ));
        
        setAllUsers(formattedUsers);
        setSearchedUsers(formattedUsers);
        setShowDevCompanyModal(false);
        setShowDevUserModal(true);
      } else {
        console.error('예상치 못한 응답 형식:', result);
        alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 중 오류 발생:', error);
      alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
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
            : selection.managers.filter(item => item.userId !== userIdInt),
          users: isSelected 
            ? selection.users.filter(item => item.userId !== userIdInt)
            : selection.users
        };
      } else {
        return {
          ...selection,
          users: isSelected
            ? [...selection.users, { userId: userIdInt }]
            : selection.users.filter(item => item.userId !== userIdInt),
          managers: isSelected
            ? selection.managers.filter(item => item.userId !== userIdInt)
            : selection.managers
        };
      }
    }));
  };

  // 고객사 사용자 선택 핸들러 수정
  const handleUserSelection = (userId, role, isSelected) => {
    const userIdInt = parseInt(userId);
    
    if (role === 'clientManager') {
      if (isSelected) {
        setClientManagers(prev => [...prev, { userId: userIdInt }]);
        setClientUsers(prev => prev.filter(item => item.userId !== userIdInt));
      } else {
        setClientManagers(prev => prev.filter(item => item.userId !== userIdInt));
      }
    } else if (role === 'clientUser') {
      if (isSelected) {
        setClientUsers(prev => [...prev, { userId: userIdInt }]);
        setClientManagers(prev => prev.filter(item => item.userId !== userIdInt));
      } else {
        setClientUsers(prev => prev.filter(item => item.userId !== userIdInt));
      }
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
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

    if (!selectedClientCompany) {
      alert('고객사를 선택해주세요.');
      return;
    }

    if (!startDate) {
      alert('시작일을 선택해주세요.');
      return;
    }

    if (!endDate) {
      alert('종료일을 선택해주세요.');
      return;
    }

    if (!validateDates()) {
      return;
    }

    const token = localStorage.getItem('token');
    
    // 모든 개발사의 담당자와 개발자 정보를 하나의 배열로 합치기
    const allDevManagers = devCompanySelections.flatMap(selection => selection.managers);
    const allDevUsers = devCompanySelections.flatMap(selection => selection.users);
    
    // companyIds 배열 생성 (고객사와 모든 개발사 ID 포함)
    const companyIds = [
      selectedClientCompany.id,
      ...devCompanySelections.map(selection => selection.companyId)
    ];
    
    const projectData = {
      name: projectName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      companyIds: companyIds,
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

  // 상태 변수 추가
  const [showClientCompanyModal, setShowClientCompanyModal] = useState(false);
  const [showDevCompanyModal, setShowDevCompanyModal] = useState(false);
  const [showClientUserModal, setShowClientUserModal] = useState(false);
  const [showDevUserModal, setShowDevUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // 고객사 선택 핸들러
  const handleClientCompanySelect = async (company) => {
    console.log('선택된 고객사:', company);
    setSelectedClientCompany(company);
    setShowClientCompanyModal(false);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(company.id), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('받은 사용자 데이터:', result);
      
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        const formattedUsers = result.data.map(user => ({
          ...user,
          userId: String(user.id)
        }));
        
        setAllUsers(formattedUsers);
        setSearchedUsers(formattedUsers);
        setShowClientUserModal(true);
      } else {
        console.error('예상치 못한 응답 형식:', result);
        alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 중 오류 발생:', error);
      alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 사용자 검색 핸들러
  const handleUserSearch = () => {
    if (!searchQuery.trim()) {
      setSearchedUsers(allUsers);
      return;
    }
    
    const filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchedUsers(filteredUsers);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchedUsers(allUsers);
    }
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
                  onBlur={handleStartDateBlur}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>종료일</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={handleEndDateChange}
                  onBlur={handleEndDateBlur}
                  min={startDate}
                  required
                />
              </FormGroup>
            </FormRow>

            <SectionDivider>고객사 정보</SectionDivider>

            <FormGroup>
              <Label>고객사</Label>
              <ClientCompanySection>
                {selectedClientCompany ? (
                  <SelectedCompanyInfo>
                    <CompanyName>{selectedClientCompany.name}</CompanyName>
                    <CompanyDetails>
                      <DetailItem>
                        <span>담당자: {clientManagers.length}명</span>
                      </DetailItem>
                      <DetailItem>
                        <span>일반 사용자: {clientUsers.length}명</span>
                      </DetailItem>
                    </CompanyDetails>
                    <ButtonGroup>
                      <EditButton type="button" onClick={() => setShowClientUserModal(true)}>
                        수정
                      </EditButton>
                      <RemoveButton type="button" onClick={() => setSelectedClientCompany(null)}>
                        삭제
                      </RemoveButton>
                    </ButtonGroup>
                  </SelectedCompanyInfo>
                ) : (
                  <SelectCompanyButton type="button" onClick={() => setShowClientCompanyModal(true)}>
                    <span>+</span> 고객사 선택
                  </SelectCompanyButton>
                )}
              </ClientCompanySection>
            </FormGroup>

            <SectionDivider>개발사 정보</SectionDivider>

            {devCompanySelections.length === 0 ? (
              <FormGroup>
                <ClientCompanySection>
                  <SelectCompanyButton onClick={() => {
                    const newSelection = { id: 1, companyId: '', managers: [], users: [], companyUsers: [] };
                    setDevCompanySelections([newSelection]);
                    setSelectedDevCompany(newSelection);
                    setShowDevCompanyModal(true);
                  }}>
                    <span>+</span> 개발사 선택
                  </SelectCompanyButton>
                </ClientCompanySection>
              </FormGroup>
            ) : (
              <>
                {devCompanySelections.map((selection, index) => (
                  <FormGroup key={selection.id}>
                    <ClientCompanySection>
                      {selection.companyId ? (
                        <SelectedCompanyInfo>
                          <CompanyName>{companies.find(c => c.id === selection.companyId)?.name}</CompanyName>
                          <CompanyDetails>
                            <DetailItem>
                              <span>담당자: {selection.managers.length}명</span>
                            </DetailItem>
                            <DetailItem>
                              <span>일반 사용자: {selection.users.length}명</span>
                            </DetailItem>
                          </CompanyDetails>
                          <ButtonGroup>
                            <EditButton type="button" onClick={() => {
                              setSelectedDevCompany(selection);
                              setShowDevUserModal(true);
                            }}>
                              수정
                            </EditButton>
                            <RemoveButton type="button" onClick={() => handleRemoveDevCompany(selection.id)}>
                              삭제
                            </RemoveButton>
                          </ButtonGroup>
                        </SelectedCompanyInfo>
                      ) : (
                        <SelectCompanyButton type="button" onClick={() => {
                          setSelectedDevCompany(selection);
                          setShowDevCompanyModal(true);
                        }}>
                          <span>+</span> 개발사 선택
                        </SelectCompanyButton>
                      )}
                    </ClientCompanySection>
                  </FormGroup>
                ))}

                <FormGroup>
                  <ClientCompanySection>
                    <AddDevCompanyButton type="button" onClick={handleAddDevCompany}>
                      <span>+</span> 개발사 추가
                    </AddDevCompanyButton>
                  </ClientCompanySection>
                </FormGroup>
              </>
            )}

            <ButtonGroup>
              <CancelButton type="button" onClick={() => navigate('/dashboard')}>취소</CancelButton>
              <SubmitButton type="submit">프로젝트 생성</SubmitButton>
            </ButtonGroup>
          </Form>
        </FormSection>

        {/* 고객사 선택 모달 */}
        {showClientCompanyModal && (
          <ModalOverlay>
            <Modal>
              <ModalHeader>
                <ModalTitle>고객사 선택</ModalTitle>
                <CloseButton onClick={() => setShowClientCompanyModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalContent>
                <CompanyList>
                  {companies
                    .filter(company => company.companyRole === 'CUSTOMER')
                    .map(company => {
                      console.log('매핑되는 회사:', company);
                      return (
                        <CompanyItem 
                          key={company.id}
                          onClick={() => {
                            console.log('클릭된 회사:', company);
                            handleClientCompanySelect(company);
                          }}
                        >
                          {company.name}
                        </CompanyItem>
                      );
                    })
                  }
                </CompanyList>
              </ModalContent>
              <ModalFooter>
                <ModalButton onClick={() => setShowClientCompanyModal(false)}>선택</ModalButton>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}

        {/* 개발사 선택 모달 */}
        {showDevCompanyModal && (
          <ModalOverlay>
            <Modal>
              <ModalHeader>
                <ModalTitle>개발사 선택</ModalTitle>
                <CloseButton onClick={() => setShowDevCompanyModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalContent>
                <CompanyList>
                  {companies
                    .filter(company => 
                      company.companyRole === 'DEVELOPER' && 
                      !devCompanySelections.some(selection => selection.companyId === company.id)
                    )
                    .map(company => (
                      <CompanyItem 
                        key={company.id}
                        onClick={() => {
                          console.log('선택된 개발사:', company);
                          handleDevCompanySelect(company);
                        }}
                      >
                        {company.name}
                      </CompanyItem>
                    ))
                  }
                </CompanyList>
              </ModalContent>
              <ModalFooter>
                <ModalButton onClick={() => setShowDevCompanyModal(false)}>선택</ModalButton>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}

        {/* 고객사 사용자 선택 모달 */}
        {showClientUserModal && (
          <ModalOverlay>
            <Modal>
              <ModalHeader>
                <ModalTitle>고객사 사용자 선택</ModalTitle>
                <CloseButton onClick={() => setShowClientUserModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalContent>
                <SearchSection>
                  <SearchInput
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="이름 또는 이메일로 검색"
                  />
                  <SearchButton onClick={handleUserSearch}>검색</SearchButton>
                </SearchSection>
                <UserList>
                  {searchedUsers.map(user => {
                    const isManager = clientManagers.some(item => item.userId === parseInt(user.userId));
                    const isUser = clientUsers.some(item => item.userId === parseInt(user.userId));
                    
                    return (
                      <UserItem key={user.userId}>
                        <UserInfo>
                          <UserName>{user.name}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                        </UserInfo>
                        <RoleButtons>
                          <RoleButton
                            selected={isManager}
                            onClick={() => handleUserSelection(user.userId, 'clientManager', !isManager)}
                            disabled={isUser}
                          >
                            담당자
                          </RoleButton>
                          <RoleButton
                            selected={isUser}
                            onClick={() => handleUserSelection(user.userId, 'clientUser', !isUser)}
                            disabled={isManager}
                          >
                            일반사용자
                          </RoleButton>
                        </RoleButtons>
                      </UserItem>
                    );
                  })}
                </UserList>
                {searchedUsers.length === 0 && (
                  <NoResults>검색 결과가 없습니다.</NoResults>
                )}
              </ModalContent>
              <ModalFooter>
                <ModalButton onClick={() => setShowClientUserModal(false)}>닫기</ModalButton>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}

        {/* 개발사 사용자 선택 모달 */}
        {showDevUserModal && (
          <ModalOverlay>
            <Modal>
              <ModalHeader>
                <ModalTitle>개발사 사용자 선택</ModalTitle>
                <CloseButton onClick={() => setShowDevUserModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalContent>
                <SearchSection>
                  <SearchInput
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="이름 또는 이메일로 검색"
                  />
                  <SearchButton onClick={handleUserSearch}>검색</SearchButton>
                </SearchSection>
                <UserList>
                  {searchedUsers.map(user => {
                    const currentSelection = devCompanySelections.find(s => s.id === selectedDevCompany.id);
                    const isManager = currentSelection?.managers.some(item => item.userId === parseInt(user.userId)) || false;
                    const isUser = currentSelection?.users.some(item => item.userId === parseInt(user.userId)) || false;
                    
                    return (
                      <UserItem key={user.userId}>
                        <UserInfo>
                          <UserName>{user.name}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                        </UserInfo>
                        <RoleButtons>
                          <RoleButton
                            selected={isManager}
                            onClick={() => handleDevUserSelection(selectedDevCompany.id, user.userId, 'devManager', !isManager)}
                            disabled={isUser}
                          >
                            담당자
                          </RoleButton>
                          <RoleButton
                            selected={isUser}
                            onClick={() => handleDevUserSelection(selectedDevCompany.id, user.userId, 'devUser', !isUser)}
                            disabled={isManager}
                          >
                            일반사용자
                          </RoleButton>
                        </RoleButtons>
                      </UserItem>
                    );
                  })}
                </UserList>
                {searchedUsers.length === 0 && (
                  <NoResults>검색 결과가 없습니다.</NoResults>
                )}
              </ModalContent>
              <ModalFooter>
                <ModalButton onClick={() => setShowDevUserModal(false)}>닫기</ModalButton>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
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

// 모달 관련 스타일 컴포넌트 추가
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #1e293b;
  }
`;

const ModalContent = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #1B5E20;
  }
`;

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CompanyItem = styled.div`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const SearchSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #1B5E20;
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #1e293b;
`;

const UserEmail = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const RoleButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const RoleButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.selected ? '#2E7D32' : '#e2e8f0'};
  border-radius: 4px;
  background-color: ${props => props.selected ? '#2E7D32' : 'white'};
  color: ${props => props.selected ? 'white' : '#64748b'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.selected ? '#1B5E20' : '#f8fafc'};
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
`;

// 스타일 컴포넌트 추가
const ClientCompanySection = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
`;

const SelectedCompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CompanyName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CompanyDetails = styled.div`
  display: flex;
  gap: 16px;
`;

const DetailItem = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

const SelectCompanyButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #f8fafc;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

export default ProjectCreate;