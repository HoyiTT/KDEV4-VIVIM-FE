import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminInquiry = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('관리자 문의');
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    inquiryType: 'NORMAL',
    projectId: null,
    title: '',
    content: ''
  });

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = decodeToken(token);
        
        if (!decodedToken?.userId) {
          console.error('User ID not found in token');
          return;
        }

        const response = await fetch(`https://dev.vivim.co.kr/api/projects?userId=${decodedToken.userId}`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const activeProjects = data.filter(project => !project.deleted);
          setProjects(activeProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      ...(name === 'inquiryType' && value !== 'PROJECT' ? { projectId: null } : {}),
      ...(name === 'projectId' ? { projectId: value ? parseInt(value) : null } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dev.vivim.co.kr/api/admininquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          inquiryType: formData.inquiryType,
          projectId: formData.projectId,
          title: formData.title,
          content: formData.content
        })
      });

      if (response.ok) {
        alert('문의가 성공적으로 등록되었습니다.');
        navigate('/admin-inquiry-list');
      } else {
        const errorData = await response.json();
        alert(`문의 등록에 실패했습니다: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('Error creating inquiry:', error);
      alert('문의 등록 중 오류가 발생했습니다.');
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
          <PageTitle>관리자 문의 작성</PageTitle>
        </Header>
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>문의 유형</Label>
            <Select 
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
            >
              <option value="NORMAL">일반 문의</option>
              <option value="PROJECT">프로젝트 문의</option>
            </Select>
          </FormGroup>

          {formData.inquiryType === 'PROJECT' && (
            <FormGroup>
              <Label>프로젝트 선택</Label>
              <StyledSelect
                name="projectId"
                value={formData.projectId || ''}
                onChange={handleChange}
                required
              >
                <option value="">프로젝트를 선택해주세요</option>
                {projects.map(project => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.name}
                  </option>
                ))}
              </StyledSelect>
            </FormGroup>
          )}

          <FormGroup>
            <Label>제목</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력해주세요"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>내용</Label>
            <TextArea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="문의 내용을 입력해주세요"
              required
              rows={10}
            />
          </FormGroup>
          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate('/admin-inquiry-list')}>
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

const MainContent = styled.main`
  padding: 24px;
  margin-top: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;

  /* 드롭다운이 열렸을 때의 스타일 */
  select:focus + .dropdown {
    display: block;
  }
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

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 1px #2E7D32;
  }
  
  option {
    padding: 8px;
    &:first-child {
      color: #64748b;
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 200px;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 1px #2E7D32;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const SubmitButton = styled(Button)`
  background-color: #2E7D32;
  color: white;
  border: none;
  
  &:hover {
    background-color: #1B5E20;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  
  &:hover {
    background-color: #f8fafc;
  }
`;

export default AdminInquiry;
