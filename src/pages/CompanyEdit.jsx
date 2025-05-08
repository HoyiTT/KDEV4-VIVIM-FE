import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';

// Move all styled components outside the component function
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
  max-width: 800px;
`;

const HeaderButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
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
  padding: 12px 20px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
    background: #2563eb;
  }
`;

const CompanyEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    businessNumber: '',
    address: '',
    phone: '',
    email: '',
    companyRole: '',
    coOwner: ''
  });

  // Move fetchCompanyData inside useEffect to avoid dependency issues
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.COMPANY_DETAIL(id), {
          headers: {
            'Authorization': token
          }
        });
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Error fetching company:', error);
        alert('회사 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchCompanyData();
  }, [id]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.COMPANY_DETAIL(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('회사 정보가 수정되었습니다.');
        navigate('/company-management');
      } else {
        alert('회사 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      alert('회사 수정 중 오류가 발생했습니다.');
    }
  }, [formData, id, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <PageTitle>회사 수정</PageTitle>
          <HeaderButtonsContainer>
            <BackButton onClick={handleBack}>
              ← 돌아가기
            </BackButton>
          </HeaderButtonsContainer>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>회사명</Label>
            <Input 
              type="text" 
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="회사명을 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사업자 번호</Label>
            <Input 
              type="text" 
              name="businessNumber"
              value={formData.businessNumber || ''}
              onChange={handleChange}
              placeholder="사업자 번호를 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>주소</Label>
            <Input 
              type="text" 
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="주소를 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>전화번호</Label>
            <Input 
              type="text" 
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="전화번호를 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>이메일</Label>
            <Input 
              type="email" 
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="이메일을 입력하세요" 
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>회사 유형</Label>
            <Select 
              name="companyRole"
              value={formData.companyRole || ''}
              onChange={handleChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="DEVELOPER">개발사</option>
              <option value="CUSTOMER">고객사</option>
              <option value="ADMIN">관리사</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>공동 대표</Label>
            <Input 
              type="text" 
              name="coOwner"
              value={formData.coOwner || ''}
              onChange={handleChange}
              placeholder="공동 대표명을 입력하세요"
            />
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate('/company-management')}>
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

export default CompanyEdit;