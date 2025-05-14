import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import MainContent from '../components/common/MainContent';
import { ActionBadge } from '../components/common/Badge';

// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

const BackButton = styled.button`
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
  max-width: 800px;
`;

const FormContainer = styled.form`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
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
  box-sizing: border-box;
  
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
  box-sizing: border-box;
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
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  white-space: ${props => props.nowrap === 'true' ? 'nowrap' : 'normal'};
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.role) {
      case 'ADMIN':
        return '#E8F5E9';
      case 'CUSTOMER':
        return '#C8E6C9';
      case 'DEVELOPER':
        return '#A5D6A7';
      default:
        return '#F5F5F5';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'ADMIN':
        return '#2E7D32';
      case 'CUSTOMER':
        return '#1B5E20';
      case 'DEVELOPER':
        return '#1B5E20';
      default:
        return '#757575';
    }
  }};
`;

const UserEdit = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  
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
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (authLoading) return;

    // 자신의 정보를 수정하는 경우는 허용
    if (!user) {
      navigate('/login');
      return;
    }

    // 관리자가 아니고, 다른 사용자의 정보를 수정하려고 하는 경우
    if (user.companyRole !== 'ADMIN' && user.id !== parseInt(userId)) {
      navigate('/dashboard');
      return;
    }

    const fetchUserData = async () => {
      if (!userId) {
        console.error('No userId provided');
        navigate('/user-management');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching user data for ID:', userId);
        
        // 사용자 정보 가져오기
        const { data: userResponse } = await axiosInstance.get(API_ENDPOINTS.USER_DETAIL(userId), {
          withCredentials: true,
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('User data response:', userResponse);
        
        if (userResponse.statusCode === 200 && userResponse.data) {
          const userDataFromApi = userResponse.data;
          console.log('Setting user data:', userDataFromApi);
          
          // 회사 목록 가져오기
          const { data: companiesResponse } = await axiosInstance.get(API_ENDPOINTS.COMPANIES, {
            withCredentials: true,
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Companies data:', companiesResponse);
          setCompanies(companiesResponse || []);
          
          // 현재 사용자의 회사 ID 찾기
          const matchingCompany = companiesResponse.find(
            company => company.name === userDataFromApi.companyName
          );
          
          if (matchingCompany) {
            console.log('Found matching company:', matchingCompany);
            setUserData({
              ...userDataFromApi,
              companyId: matchingCompany.id
            });
            setPhone(userDataFromApi.phone || '');
          } else {
            setUserData(userDataFromApi);
            setPhone(userDataFromApi.phone || '');
          }
        } else {
          throw new Error(userResponse.statusMessage || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          code: error.code
        });
        
        if (error.code === 403) {
          alert('접근 권한이 없습니다. 관리자에게 문의하세요.');
        } else {
          alert('사용자 정보를 불러오는데 실패했습니다.');
        }
        navigate('/user-management');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate, user, authLoading]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length <= 3) {
      formatted = value;
    } else if (value.length <= 7) {
      formatted = value.slice(0, 3) + '-' + value.slice(3);
    } else {
      formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    setPhone(formatted);
    setUserData(prev => ({ ...prev, phone: formatted }));
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'companyId') {
      const selectedCompany = companies.find(c => String(c.id) === value);
      setUserData(prevState => ({
        ...prevState,
        companyId: value,
        companyRole: selectedCompany ? selectedCompany.companyRole : ''
      }));
    } else if (name === 'phone') {
      handlePhoneChange(e);
    } else {
      setUserData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  }, [companies]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    // 전화번호 유효성 검사
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(userData.phone)) {
      alert('전화번호는 010-1234-5678 형식으로 입력해주세요.');
      return;
    }
    try {
      const { data } = await axiosInstance.put(API_ENDPOINTS.USER_DETAIL(userId), {
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        companyId: userData.companyId,
        modifiedAt: new Date().toISOString()
      }, {
        withCredentials: true,
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      // API가 200 OK를 반환하면 성공으로 처리
      if (user.companyRole === 'ADMIN') {
        navigate('/user-management');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('사용자 수정 중 오류가 발생했습니다.');
    }
  }, [userData, userId, navigate, user]);

  const handlePasswordChange = useCallback(async () => {
    if (!newPassword) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      const { data } = await axiosInstance.put(API_ENDPOINTS.USER_PASSWORD_MODIFY(userId, newPassword), null, {
        withCredentials: true,
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      if (data.statusCode === 200) {
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

  const handleBack = () => {
    navigate(-1);
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'CUSTOMER':
        return '고객사';
      case 'DEVELOPER':
        return '개발사';
      default:
        return '역할 없음';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <MainContent>
          <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div>데이터를 불러오는 중...</div>
          </div>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <MainContent>
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <HeaderContainer>
            <PageTitle>사용자 수정</PageTitle>
            <BackButton onClick={handleBack}>
              ← 돌아가기
            </BackButton>
          </HeaderContainer>

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
                <ActionBadge 
                  type="primary" 
                  size="large" 
                  onClick={handlePasswordChange}
                >
                  비밀번호 변경
                </ActionBadge>
              </PasswordContainer>
            </FormGroup>

            <FormGroup>
              <Label>전화번호</Label>
              <Input 
                type="text" 
                name="phone"
                value={phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>소속 회사</Label>
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
            </FormGroup>

            <FormGroup>
              <Label>해당 회사 역할</Label>
              <ReadOnlyField>
                <RoleBadge role={userData.companyRole}>
                  {getRoleText(userData.companyRole)}
                </RoleBadge>
              </ReadOnlyField>
            </FormGroup>

            <ButtonContainer>
              <CancelButton type="button" onClick={() => navigate('/user-management')}>
                취소
              </CancelButton>
              <ActionBadge 
                type="success" 
                size="large" 
                onClick={handleSubmit}
              >
                수정하기
              </ActionBadge>
            </ButtonContainer>
          </FormContainer>
        </div>
      </MainContent>
    </PageContainer>
  );
};

export default UserEdit;