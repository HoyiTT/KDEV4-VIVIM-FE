import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';

// 파일 상단, 컴포넌트 함수 바깥에 선언!
const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 0px;
`;

const MyDiv = styled.div`
  // 스타일
`;

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
  const [projectFee, setProjectFee] = useState('');
  
  // Selected users
  const [clientManagers, setClientManagers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [devManagers, setDevManagers] = useState([]);
  const [devUsers, setDevUsers] = useState([]);

  // Company users
  const [clientCompanyUsers, setClientCompanyUsers] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Companies data
  const [companies, setCompanies] = useState([]);
  
  // 상태 변수 추가
  const [showClientCompanyModal, setShowClientCompanyModal] = useState(false);
  const [showDevCompanyModal, setShowDevCompanyModal] = useState(false);
  const [showClientUserModal, setShowClientUserModal] = useState(false);
  const [showDevUserModal, setShowDevUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // 개발사 다중 선택을 위한 상태 추가
  const [devCompanySelections, setDevCompanySelections] = useState([
    { id: 1, companyId: '', managers: [], users: [], companyUsers: [] }
  ]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANIES);
        setCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch project data
  useEffect(() => {
    if (projectId) {
      Promise.all([
        axiosInstance.get(API_ENDPOINTS.PROJECT_DETAIL(projectId), {
          withCredentials: true
        }),
        axiosInstance.get(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/companies`, {
          withCredentials: true
        }),
        axiosInstance.get(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/users`, {
          withCredentials: true
        })
      ])
        .then(([projectResponse, companiesResponse, usersResponse]) => {
          const projectData = projectResponse.data;
          const companiesData = companiesResponse.data;
          const usersData = usersResponse.data;
          
          // Populate form with project data
          setProjectName(projectData.name);
          setDescription(projectData.description);
          setStartDate(projectData.startDate);
          setEndDate(projectData.endDate);
          
          // projectFee 값이 있는 경우에만 천 단위 쉼표 포맷팅 적용
          if (projectData.projectFee) {
            const formattedFee = projectData.projectFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setProjectFee(formattedFee);
          }
          
          // 사용자 정보 설정
          if (usersData && Array.isArray(usersData)) {
            const clientManagers = usersData
              .filter(user => user.role === 'CLIENT_MANAGER')
              .map(user => ({
                userId: String(user.userId),
                name: user.userName
              }));
            const clientUsers = usersData
              .filter(user => user.role === 'CLIENT_USER')
              .map(user => ({
                userId: String(user.userId),
                name: user.userName
              }));
            
            setClientManagers(clientManagers);
            setClientUsers(clientUsers);
          }
          
          // 회사 정보 설정
          if (companiesData && companiesData.length > 0) {
            // 첫 번째 회사를 고객사로 설정
            const clientCompany = companiesData[0];
            // 나머지 회사들을 개발사로 설정
            const devCompanies = companiesData.slice(1);

            if (clientCompany) {
              setSelectedClientCompany(clientCompany);
              // 고객사 사용자 정보 가져오기
              axiosInstance.get(API_ENDPOINTS.COMPANY_EMPLOYEES(clientCompany.id), {
                withCredentials: true
              })
                .then(result => {
                  if (result.data.statusCode === 200 && Array.isArray(result.data.data)) {
                    const formattedUsers = result.data.data.map(user => ({
                      id: user.id,
                      userId: String(user.id),
                      name: user.name,
                      email: user.email,
                      companyRole: user.companyRole
                    }));
                    setClientCompanyUsers(formattedUsers);
                  }
                });
            }
            
            if (devCompanies && devCompanies.length > 0) {
              // 개발사 선택 상태 초기화
              const initialDevSelections = devCompanies.map((company, index) => ({
                id: index + 1,
                companyId: company.id,
                managers: [],
                users: [],
                companyUsers: []
              }));
              setDevCompanySelections(initialDevSelections);

              // 각 개발사의 사용자 정보 가져오기
              devCompanies.forEach(company => {
                axiosInstance.get(API_ENDPOINTS.COMPANY_EMPLOYEES(company.id), {
                  withCredentials: true
                })
                  .then(result => {
                    if (result.data.statusCode === 200 && Array.isArray(result.data.data)) {
                      const formattedUsers = result.data.data.map(user => ({
                        id: user.id,
                        userId: String(user.id),
                        name: user.name,
                        email: user.email,
                        companyRole: user.companyRole
                      }));

                      // 해당 개발사의 기존 사용자 정보 설정
                      if (usersData && Array.isArray(usersData)) {
                        const companyDevManagers = usersData
                          .filter(user => user.role === 'DEVELOPER_MANAGER')
                          .map(user => ({
                            userId: String(user.userId)
                          }));
                        const companyDevUsers = usersData
                          .filter(user => user.role === 'DEVELOPER_USER')
                          .map(user => ({
                            userId: String(user.userId)
                          }));

                        setDevCompanySelections(prev => prev.map(selection => 
                          selection.companyId === company.id
                            ? { 
                                ...selection, 
                                companyUsers: formattedUsers,
                                managers: companyDevManagers,
                                users: companyDevUsers
                              }
                            : selection
                        ));
                      } else {
                        setDevCompanySelections(prev => prev.map(selection => 
                          selection.companyId === company.id
                            ? { ...selection, companyUsers: formattedUsers }
                            : selection
                        ));
                      }
                    }
                  });
              });
            }
          }
          
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching project:', error);
          setLoading(false);
        });
    }
  }, [projectId]);

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleUserSelection = (userId, role, isSelected) => {
    const user = allUsers.find(u => u.userId === userId);
    
    if (!user) return;
    
    const userObj = {
      userId: userId,
      name: user.userName,
      email: user.email || ''
    };
    
    if (role === 'clientManager') {
      if (isSelected) {
        setClientManagers(prev => [...prev, userObj]);
        setClientUsers(prev => prev.filter(item => item.userId !== userId));
      } else {
        setClientManagers(prev => prev.filter(item => item.userId !== userId));
      }
    } else if (role === 'clientUser') {
      if (isSelected) {
        setClientUsers(prev => [...prev, userObj]);
        setClientManagers(prev => prev.filter(item => item.userId !== userId));
      } else {
        setClientUsers(prev => prev.filter(item => item.userId !== userId));
      }
    }
  };

  const handleProjectFeeChange = (e) => {
    const value = e.target.value;
    // 숫자와 쉼표만 허용
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    
    // 20억 제한
    const maxAmount = 2000000000;
    const numericValue = parseInt(onlyNumbers) || 0;
    
    if (numericValue > maxAmount) {
      alert('계약금은 최대 20억원까지만 입력 가능합니다.');
      return;
    }
    
    // 쉼표 추가
    const formattedValue = onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setProjectFee(formattedValue);
  };

  // 날짜 유효성 검사 함수 추가
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateDates()) {
      return;
    }
    
    // 모든 개발사 사용자 ID를 저장하는 Map
    const allDevUsersMap = new Map();
    
    // Create project data object with proper role values
    const projectData = {
      name: projectName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      companyIds: [
        selectedClientCompany.id,
        ...devCompanySelections.map(selection => selection.companyId)
      ],
      projectFee: parseInt(projectFee.replace(/,/g, '')), // 쉼표 제거하고 숫자로 변환
      clientManagers: clientManagers.map(manager => ({
        userId: parseInt(manager.userId)
      })),
      clientUsers: clientUsers.map(user => ({
        userId: parseInt(user.userId)
      })),
      devManagers: devCompanySelections.flatMap(selection => 
        selection.managers.map(manager => {
          const userId = parseInt(manager.userId);
          if (!allDevUsersMap.has(userId)) {
            allDevUsersMap.set(userId, 'manager');
            return { userId };
          }
          return null;
        }).filter(Boolean)
      ),
      devUsers: devCompanySelections.flatMap(selection => 
        selection.users.map(user => {
          const userId = parseInt(user.userId);
          if (!allDevUsersMap.has(userId)) {
            allDevUsersMap.set(userId, 'user');
            return { userId };
          }
          return null;
        }).filter(Boolean)
      )
    };
    
    console.log('Project data to be sent to server:', projectData);
    
    // Send PUT request to update the project
    axiosInstance.put(API_ENDPOINTS.PROJECT_DETAIL(projectId), projectData, {
      withCredentials: true
    })
    .then(response => {
      console.log('Success:', response.data);
      // Navigate back to project detail page on success
      navigate(`/project/${projectId}`);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('프로젝트 수정 중 오류가 발생했습니다: ' + error.message);
    });
  };

  // 고객사 수정 버튼 클릭 핸들러
  const handleClientCompanyEdit = async () => {
    if (!selectedClientCompany) return;
    
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.COMPANY_EMPLOYEES(selectedClientCompany.id), {
        withCredentials: true
      });

      if (response.data.statusCode === 200 && Array.isArray(response.data.data)) {
        const formattedUsers = response.data.data.map(user => ({
          id: user.id,
          userId: String(user.id),
          name: user.name,
          email: user.email,
          companyRole: user.companyRole
        }));
        
        setAllUsers(formattedUsers);
        setSearchedUsers(formattedUsers);
        setShowClientUserModal(true);
      } else {
        console.error('예상치 못한 응답 형식:', response.data);
        alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 중 오류 발생:', error);
      alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 고객사 선택 핸들러
  const handleClientCompanySelect = async (company) => {
    console.log('선택된 고객사:', company);
    setSelectedClientCompany(company);
    setShowClientCompanyModal(false);
    
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.COMPANY_EMPLOYEES(company.id), {
        withCredentials: true
      });

      if (response.data.statusCode === 200 && Array.isArray(response.data.data)) {
        const formattedUsers = response.data.data.map(user => ({
          id: user.id,
          userId: String(user.id),
          name: user.name,
          email: user.email,
          companyRole: user.companyRole
        }));
        
        setAllUsers(formattedUsers);
        setSearchedUsers(formattedUsers);
        setShowClientUserModal(true);
      } else {
        console.error('예상치 못한 응답 형식:', response.data);
        alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 중 오류 발생:', error);
      alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 개발사 추가 함수
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

  // 개발사 제거 함수
  const handleRemoveDevCompany = (selectionId) => {
    setDevCompanySelections(prev => prev.filter(selection => selection.id !== selectionId));
  };

  // 개발사 수정 버튼 클릭 핸들러 수정
  const handleDevCompanyEdit = async (selection) => {
    console.log('수정할 개발사:', selection);
    setSelectedDevCompany(selection);
    
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.COMPANY_EMPLOYEES(selection.companyId), {
        withCredentials: true
      });

      if (response.data.statusCode === 200 && Array.isArray(response.data.data)) {
        const formattedUsers = response.data.data.map(user => ({
          id: user.id,
          userId: String(user.id),
          name: user.name,
          email: user.email,
          companyRole: user.companyRole
        }));
        
        setAllUsers(formattedUsers);
        setSearchedUsers(formattedUsers);
        setShowDevUserModal(true);
      } else {
        console.error('예상치 못한 응답 형식:', response.data);
        alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 중 오류 발생:', error);
      alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 개발사 선택 핸들러 수정
  const handleDevCompanySelect = async (company) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.COMPANY_EMPLOYEES(company.id), {
        withCredentials: true
      });
      
      if (response.data.statusCode === 200 && Array.isArray(response.data.data)) {
        // 모든 사용자를 포맷팅
        const formattedUsers = response.data.data.map(user => ({
          id: user.id,
          userId: String(user.id),
          name: user.name,
          email: user.email,
          companyRole: user.companyRole
        }));
        
        setDevCompanySelections(prev => prev.map(selection => 
          selection.id === selectedDevCompany?.id
            ? { ...selection, companyId: company.id, companyUsers: formattedUsers }
            : selection
        ));
        
        setAllUsers(formattedUsers);
        setSearchedUsers(formattedUsers);
        setShowDevCompanyModal(false);
        setShowDevUserModal(true);
      } else {
        alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 데이터를 가져오는 중 오류 발생:', error);
      alert('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 개발사 사용자 선택 핸들러 수정
  const handleDevUserSelection = (selectionId, userId, role, isSelected) => {
    console.log('개발사 사용자 선택:', { selectionId, userId, role, isSelected });
    
    setDevCompanySelections(prev => prev.map(selection => {
      if (selection.id !== selectionId) return selection;
      
      const user = allUsers.find(u => u.userId === userId);
      if (!user) return selection;
      
      // 현재 선택된 개발사의 모든 사용자 목록에서 해당 사용자 제거
      const updatedManagers = selection.managers.filter(item => item.userId !== userId);
      const updatedUsers = selection.users.filter(item => item.userId !== userId);
      
      // 새로운 역할에 사용자 추가
      if (isSelected) {
        if (role === 'devManager') {
          updatedManagers.push({ userId, name: user.name });
        } else {
          updatedUsers.push({ userId, name: user.name });
        }
      }
      
      return {
        ...selection,
        managers: updatedManagers,
        users: updatedUsers
      };
    }));
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
      <ContentWrapper>
        <MainContent>
          {loading ? (
            <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
          ) : (
            <>
            <HeaderRow>
              <BackButton onClick={() => navigate(`/project/${projectId}`)}>
                <span>← </span>
                돌아가기
              </BackButton>
              <FormHeader>
                  <FormTitle>프로젝트 수정</FormTitle>
                </FormHeader>
              </HeaderRow>
              <FormContainer>

                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label>프로젝트 이름</Label>
                    <Input 
                      type="text" 
                      value={projectName} 
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="프로젝트 이름을 입력하세요"
                      maxLength={20}
                      required
                    />
                    <CharacterCount>{projectName.length}/20</CharacterCount>
                  </FormGroup>

                  <FormGroup>
                    <Label>프로젝트 설명</Label>
                    <TextArea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="프로젝트 설명을 입력하세요"
                      maxLength={50}
                      required
                    />
                    <CharacterCount>{description.length}/50</CharacterCount>
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label>시작일</Label>
                      <Input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        onBlur={handleStartDateBlur}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>종료일</Label>
                      <Input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        onBlur={handleEndDateBlur}
                        min={startDate}
                        required
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label>계약금 (원)</Label>
                    <Input 
                      type="text" 
                      value={projectFee}
                      onChange={handleProjectFeeChange}
                      placeholder="계약금을 입력하세요"
                      required
                    />
                    <CharacterCount>
                      {projectFee ? `${parseInt(projectFee.replace(/,/g, '')).toLocaleString()}원` : '0원'} / 2,000,000,000원
                    </CharacterCount>
                  </FormGroup>

                  <SectionDivider>고객사 정보</SectionDivider>

                  <FormGroup>
                    <Label>고객사</Label>
                    <ClientCompanySection>
                      {selectedClientCompany ? (
                        <SelectedCompanyInfo>
                          <CompanyName>{selectedClientCompany.name}</CompanyName>
                          <CompanyDetails>
                            {/* <DetailItem>
                              <span>담당자: {clientManagers.length}명</span>
                            </DetailItem>
                            <DetailItem>
                              <span>일반 사용자: {clientUsers.length}명</span> */}
                          </CompanyDetails>
                          <ButtonGroup>
                            <EditButton 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleClientCompanyEdit();
                              }}
                            >
                              수정
                            </EditButton>
                            <RemoveButton 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedClientCompany(null);
                              }}
                            >
                              삭제
                            </RemoveButton>
                          </ButtonGroup>
                        </SelectedCompanyInfo>
                      ) : (
                        <SelectCompanyButton 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowClientCompanyModal(true);
                          }}
                        >
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
                                  {/* <DetailItem>
                                    <span>담당자: {selection.managers.length}명</span>
                                  </DetailItem>
                                  <DetailItem>
                                    <span>일반 사용자: {selection.users.length}명</span>
                                  </DetailItem> */}
                                </CompanyDetails>
                                <ButtonGroup>
                                  <EditButton 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDevCompanyEdit(selection);
                                    }}
                                  >
                                    수정
                                  </EditButton>
                                  <RemoveButton 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleRemoveDevCompany(selection.id);
                                    }}
                                  >
                                    삭제
                                  </RemoveButton>
                                </ButtonGroup>
                              </SelectedCompanyInfo>
                            ) : (
                              <SelectCompanyButton 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedDevCompany(selection);
                                  setShowDevCompanyModal(true);
                                }}
                              >
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
                    <CancelButton type="button" onClick={() => navigate('/admin/projects')}>취소</CancelButton>
                    <SubmitButton type="submit">프로젝트 수정</SubmitButton>
                  </ButtonGroup>
                </Form>
              </FormContainer>
            </>
          )}

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
                      .map(company => (
                        <CompanyItem 
                          key={company.id}
                          onClick={() => handleClientCompanySelect(company)}
                        >
                          {company.name}
                        </CompanyItem>
                      ))
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
                      .filter(company => company.companyRole === 'DEVELOPER')
                      .filter(company => !devCompanySelections.some(selection => selection.companyId === company.id))
                      .map(company => (
                        <CompanyItem 
                          key={company.id}
                          onClick={() => handleDevCompanySelect(company)}
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
                      const isClientManager = clientManagers.some(item => item.userId === user.userId);
                      const isClientUser = clientUsers.some(item => item.userId === user.userId);
                      
                      return (
                        <UserItem key={user.userId}>
                          <UserInfo>
                            <UserName>{user.name}</UserName>
                            <UserEmail>{user.email}</UserEmail>
                          </UserInfo>
                          <RoleButtons>
                            <RoleButton
                              selected={isClientManager}
                              onClick={() => handleUserSelection(user.userId, 'clientManager', !isClientManager)}
                              disabled={isClientUser}
                            >
                              담당자
                            </RoleButton>
                            <RoleButton
                              selected={isClientUser}
                              onClick={() => handleUserSelection(user.userId, 'clientUser', !isClientUser)}
                              disabled={isClientManager}
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
                      const isDevManager = currentSelection?.managers.some(item => item.userId === user.userId) || false;
                      const isDevUser = currentSelection?.users.some(item => item.userId === user.userId) || false;
                      
                      return (
                        <UserItem key={user.userId}>
                          <UserInfo>
                            <UserName>{user.name}</UserName>
                            <UserEmail>{user.email}</UserEmail>
                          </UserInfo>
                          <RoleButtons>
                            <RoleButton
                              selected={isDevManager}
                              onClick={() => handleDevUserSelection(selectedDevCompany.id, user.userId, 'devManager', !isDevManager)}
                              disabled={isDevUser}
                            >
                              담당자
                            </RoleButton>
                            <RoleButton
                              selected={isDevUser}
                              onClick={() => handleDevUserSelection(selectedDevCompany.id, user.userId, 'devUser', !isDevUser)}
                              disabled={isDevManager}
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
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 800px;
`;

const FormHeader = styled.div`
  margin-bottom: 24px;
  width: 100%;
  max-width: 800px;
`;

const BackButton = styled.button`
  border: none;
  background-color: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
  white-space: nowrap;
  &:hover {
    color: #2E7D32;
  }
`;

const FormTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  white-space: nowrap;
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
      white-space: nowrap;
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
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
    white-space: nowrap;
  }

  &:active {
    transform: translateY(0);
    background: #2563eb;
    white-space: nowrap;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 50%;
  max-width: 500px;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 8px;
  border: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #2E7D32;
  }
`;

const ModalContent = styled.div`
  margin-bottom: 24px;
`;

const CompanyList = styled.ul`
  list-style: none;
  padding: 0;
`;

const CompanyItem = styled.li`
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8fafc;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: #1B5E20;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RemoveButton = styled.button`
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #b91c1c;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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

const SearchSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
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

const SearchButton = styled.button`
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

const UserList = styled.ul`
  list-style: none;
  padding: 0;
`;

const UserItem = styled.li`
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const UserEmail = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const RoleButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const RoleButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.selected ? '#2E7D32' : '#e2e8f0'};
  border-radius: 4px;
  background-color: ${props => props.selected ? 'white' : '#f8fafc'};
  color: ${props => props.selected ? '#2E7D32' : '#64748b'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.selected ? '#f0fdf4' : '#f8fafc'};
  }
`;

const NoResults = styled.p`
  text-align: center;
  color: #64748b;
  margin: 0;
`;

const LoadingMessage = styled.div`
  font-size: 16px;
  color: #64748b;
`;

const SectionDivider = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
`;

const ClientCompanySection = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
`;

const AddDevCompanyButton = styled.button`
  width: 100%;
  padding: 12px;
  background: white;
  color: #2E7D32;
  border: 1px dashed #2E7D32;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  
  &:hover {
    background: #f0fdf4;
  }
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: right;
  margin-top: 4px;
`;

export default ProjectModify;