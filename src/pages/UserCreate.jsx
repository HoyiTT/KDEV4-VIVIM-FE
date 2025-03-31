import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const UserCreate = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('유저 관리');
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]); // 필터링된 회사 목록
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyId: '',
    companyRole: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // companyRole이 변경될 때 회사 목록 필터링
    if (name === 'companyRole') {
      const filtered = companies.filter(company => company.companyRole === value);
      setFilteredCompanies(filtered);
      setFormData(prevState => ({
        ...prevState,
        companyId: '', // 역할이 변경되면 선택된 회사 초기화
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('사용자가 성공적으로 등록되었습니다.');
        navigate('/user-management');
      } else {
        alert('사용자 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('사용자 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <DashboardContainer>
      <Sidebar 
        activeMenuItem={activeMenuItem} 
        handleMenuClick={handleMenuClick} 
      />
      <MainContent>
        <Header>
          <PageTitle>사용자 등록</PageTitle>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>이름</Label>
            <Input 
              type="text" 
              name="name"
              value={formData.name}
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
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>비밀번호</Label>
            <Input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사용자 유형</Label>
            <Select 
              name="companyRole"
              value={formData.companyRole}
              onChange={handleChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="DEVELOPER">개발사</option>
              <option value="CUSTOMER">고객사</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>소속회사</Label>
            <Select 
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              required
              disabled={!formData.companyRole} // 역할 선택 전에는 비활성화
            >
              <option value="">선택하세요</option>
              {filteredCompanies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate('/user-management')}>
              취소
            </CancelButton>
            <SubmitButton type="submit">
              등록
            </SubmitButton>
          </ButtonContainer>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

// Styled components are the same as CompanyCreate.jsx
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 24px;
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

export default UserCreate;