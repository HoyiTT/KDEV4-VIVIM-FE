import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('회사 관리');
  
  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    coOwner: '',
    businessNumber: '',
    companyRole: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/companies', {
        method: 'POST',  // Changed from 'PUT' to 'POST'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('회사가 성공적으로 등록되었습니다.');
        navigate('/company-management');
      } else {
        alert('회사 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('회사 등록 중 오류가 발생했습니다.');
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
          <PageTitle>회사 등록</PageTitle>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>회사 이름</Label>
            <Input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="회사 이름을 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사업자 번호</Label>
            <Input 
              type="text" 
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder="000-00-00000" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사업장 주소</Label>
            <Input 
              type="text" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="사업장 주소를 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>회사 번호</Label>
            <Input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="02-0000-0000" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>회사 이메일</Label>
            <Input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="company@example.com" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사업장 유형</Label>
            <Select 
              name="companyRole"
              value={formData.companyRole}
              onChange={handleChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="ADMIN">관리자</option>
              <option value="DEVELOPER">개발사</option>
              <option value="CUSTOMER">고객사</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>대표자 이름</Label>
            <Input 
              type="text" 
              name="coOwner"
              value={formData.coOwner}
              onChange={handleChange}
              placeholder="대표자 이름을 입력하세요" 
              required
            />
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate('/company-management')}>
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

export default CompanyCreate;