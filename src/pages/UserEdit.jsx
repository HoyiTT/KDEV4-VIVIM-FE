import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

// Styled components
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
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  margin-bottom: 24px;
  width: 100%;
  max-width: 800px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const FormContainer = styled.form`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 800px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const ReadOnlyField = styled.div`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8fafc;
  color: #64748b;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #1B5E20;
  }
`;

const PasswordButton = styled.button`
  padding: 10px 16px;
  background: transparent;
  color: #4F6AFF;
  border: 1px solid #4F6AFF;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background: rgba(79, 106, 255, 0.1);
  }
`;

const PasswordContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
`;

const PasswordInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

// Add a new styled component for the Select dropdown
const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const UserEdit = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  // Add token decoding logic
  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const isAdmin = decodedToken?.role === 'ADMIN';

  const [activeMenuItem, setActiveMenuItem] = useState('사용자 관리');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    companyRole: ''
  });
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [companies, setCompanies] = useState([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.USER_DETAIL(userId), {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const result = await response.json();
        console.log('User data:', result);
        
        if (result.statusCode === 200 && result.data) {
          // Store the user data first
          const userDataFromApi = result.data;
          setUserData(userDataFromApi);
          
          // Then fetch companies to find the matching company
          const companiesResponse = await fetch(API_ENDPOINTS.COMPANIES, {
            headers: {
              'Authorization': token
            }
          });
          
          if (companiesResponse.ok) {
            const companiesData = await companiesResponse.json();
            setCompanies(companiesData);
            
            // Find the company that matches the user's company name
            const matchingCompany = companiesData.find(
              company => company.name === userDataFromApi.companyName
            );
            
            if (matchingCompany) {
              // Update the userData with the matching company ID
              setUserData(prevState => ({
                ...prevState,
                companyId: matchingCompany.id
              }));
            }
          }
        } else {
          throw new Error(result.statusMessage || 'Failed to fetch user data');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        alert('사용자 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Remove the separate companies fetch since we're doing it in the user data fetch
  useEffect(() => {
    // This useEffect is now empty as we're fetching companies in the user data fetch
  }, []);

  // Add a new useEffect to fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.COMPANIES, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        
        const result = await response.json();
        setCompanies(result);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  // Update handleChange to fetch the company role when company changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // If company is changed, fetch the company details to get the role
    if (name === 'companyId' && value) {
      const fetchCompanyRole = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.COMPANY_DETAIL(value), {
            headers: {
              'Authorization': token
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch company details');
          }
          
          const result = await response.json();
          
          // Update the company name and role
          setUserData(prevState => ({
            ...prevState,
            companyName: result.name,
            companyRole: result.companyRole
          }));
        } catch (error) {
          console.error('Error fetching company details:', error);
        }
      };
      
      fetchCompanyRole();
    }
  }, []);

  // Update handleSubmit to include all required fields
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.USER_DETAIL(userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          companyId: userData.companyId,
          modifiedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('사용자 정보가 수정되었습니다.');
        navigate('/user-management');
      } else {
        alert('사용자 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('사용자 수정 중 오류가 발생했습니다.');
    }
  }, [userData, userId, navigate]);

  const handlePasswordChange = useCallback(async () => {
    if (!newPassword) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.USER_PASSWORD_MODIFY(userId, newPassword), {
        method: 'PUT',
        headers: {
          'Authorization': token
        }
      });

      if (response.ok) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        setNewPassword('');
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  }, [userId, newPassword]);

  const handleMenuClick = useCallback((menuItem) => {
    setActiveMenuItem(menuItem);
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <Navbar 
          activeMenuItem={activeMenuItem} 
          handleMenuClick={handleMenuClick} 
        />
        <MainContent>
          <div>데이터를 불러오는 중...</div>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem} 
        handleMenuClick={handleMenuClick} 
      />
      <MainContent>
        <Header>
          <PageTitle>사용자 수정</PageTitle>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>이름</Label>
            <Input 
              type="text" 
              name="name"
              value={userData.name || ''}
              onChange={handleChange}
              placeholder="이름을 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>이메일</Label>
            <Input 
              type="email" 
              name="email"
              value={userData.email || ''}
              onChange={handleChange}
              placeholder="이메일을 입력하세요" 
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>비밀번호</Label>
            <PasswordContainer>
              <PasswordInput 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
              />
              <PasswordButton type="button" onClick={handlePasswordChange}>
                비밀번호 변경
              </PasswordButton>
            </PasswordContainer>
          </FormGroup>

          <FormGroup>
            <Label>전화번호</Label>
            <Input 
              type="text" 
              name="phone"
              value={userData.phone || ''}
              onChange={handleChange}
              placeholder="전화번호를 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>소속 회사</Label>
            {isAdmin ? (
              <Select
                name="companyId"
                value={userData.companyId || ''}
                onChange={handleChange}
                required
              >
                <option value="">회사 선택</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            ) : (
              <ReadOnlyField>
                {userData.companyName}
              </ReadOnlyField>
            )}
          </FormGroup>

          <FormGroup>
            <Label>해당 회사 역할</Label>
            <ReadOnlyField>
              {userData.companyRole === 'ADMIN' ? '관리자' : 
               userData.companyRole === 'CUSTOMER' ? '고객사' : 
               userData.companyRole === 'DEVELOPER' ? '개발사' : 
               '역할 없음'}
            </ReadOnlyField>
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate('/user-management')}>
              취소
            </CancelButton>
            <SubmitButton type="submit">
              수정하기
            </SubmitButton>
          </ButtonContainer>
        </FormContainer>
      </MainContent>
    </PageContainer>
  );
};

export default UserEdit;