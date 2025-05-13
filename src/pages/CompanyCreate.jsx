import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('회사 관리');
  
  // 주소 모달 상태
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

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

  const [addressDetail, setAddressDetail] = useState('');

  // 회사 번호 상태 및 핸들러 추가
  const [companyPhone, setCompanyPhone] = useState('');

  const handleCompanyPhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    // 지역번호(2~3자리) + 중간(3~4자리) + 끝(4자리)
    let formatted = value;
    if (value.length <= 2) {
      formatted = value;
    } else if (value.length <= 5) {
      formatted = value.slice(0, 2) + '-' + value.slice(2);
    } else if (value.length <= 9) {
      formatted = value.slice(0, 2) + '-' + value.slice(2, value.length - 4) + '-' + value.slice(-4);
    } else {
      formatted = value.slice(0, 3) + '-' + value.slice(3, value.length - 4) + '-' + value.slice(-4);
    }
    setCompanyPhone(formatted);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // 사업자 번호 입력 핸들러 추가
  const handleBusinessNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    let formatted = value;
    if (value.length > 5) {
      formatted = `${value.slice(0,3)}-${value.slice(3,5)}-${value.slice(5)}`;
    } else if (value.length > 3) {
      formatted = `${value.slice(0,3)}-${value.slice(3)}`;
    }
    setFormData(prevState => ({
      ...prevState,
      businessNumber: formatted
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'addressDetail') {
      setAddressDetail(value);
      return;
    }
    if (name === 'businessNumber') {
      handleBusinessNumberChange(e);
      return;
    }
    if (name === 'phone') {
      handleCompanyPhoneChange(e);
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddressSearch = () => setIsAddressModalOpen(true);
  const handleAddressSelect = (address) => {
    setFormData(prev => ({ ...prev, address }));
    setIsAddressModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 사업자 번호 유효성 검사
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberRegex.test(formData.businessNumber)) {
      alert('사업자 번호는 xxx-xx-xxxxx 형식으로 입력해주세요.');
      return;
    }
    // 회사 번호 유효성 검사 (02-1234-5678, 031-123-4567 등)
    const phoneRegex = /^(0\d{1,2})-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('회사 번호는 02-1234-5678 또는 031-123-4567 형식으로 입력해주세요.');
      return;
    }
    // 주소 + 상세주소 합치기
    const fullAddress = formData.address + (addressDetail ? ' ' + addressDetail : '');
    const submitData = { ...formData, address: fullAddress };
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.COMPANIES,
        submitData,
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 201) {
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
    <PageContainer>
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
              placeholder="123-45-67890" 
              maxLength={13}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사업장 주소</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="도로명 주소를 입력하세요"
                required
                readOnly
              />
              <SearchButton type="button" onClick={handleAddressSearch}>
                검색
              </SearchButton>
            </div>
            <Input
              type="text"
              name="addressDetail"
              value={addressDetail}
              onChange={handleChange}
              placeholder="상세 주소를 입력하세요"
              style={{ marginTop: 8 }}
            />
          </FormGroup>

          {/* 주소 검색 모달 */}
          {isAddressModalOpen && (
            <AddressModal
              onSelect={handleAddressSelect}
              onClose={() => setIsAddressModalOpen(false)}
            />
          )}

          <FormGroup>
            <Label>회사 번호</Label>
            <Input 
              type="text" 
              name="phone"
              value={companyPhone}
              onChange={handleChange}
              placeholder="02-1234-5678"
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
    </PageContainer>
  );
};

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
  align-items: center; // 가운데 정렬을 위해 추가
`;

const Header = styled.div`
  margin-bottom: 24px;
  width: 100%;
  max-width: 800px; // FormContainer와 동일한 최대 너비
`;

const FormContainer = styled.form`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 800px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

// SearchButton 추가
const SearchButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  white-space: nowrap;
  min-width: 60px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
    background: #2563eb;
  }
`;

// 주소 검색 모달 컴포넌트
const AddressModal = ({ onSelect, onClose }) => {
  const elementRef = useRef(null);

  React.useEffect(() => {
    let postcode = null;
    let timeout = setTimeout(() => {
      if (elementRef.current && window.daum && window.daum.Postcode) {
        postcode = new window.daum.Postcode({
          oncomplete: function(data) {
            onSelect(data.roadAddress || data.address);
          },
          width: '100%',
          height: '100%',
        });
        postcode.embed(elementRef.current);
      }
    }, 0); // 한 프레임 뒤에 실행

    return () => {
      clearTimeout(timeout);
      if (elementRef.current) {
        elementRef.current.innerHTML = '';
      }
    };
  }, [onSelect]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 400, height: 500, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>닫기</button>
        <div ref={elementRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default CompanyCreate;