import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminInquiryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    inquiryType: '',
    projectId: null
  });
  const [projects, setProjects] = useState([]);

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const isAdmin = decodedToken?.role === 'ADMIN';

  const [activeMenuItem, setActiveMenuItem] = useState('내 문의 내역');

  // 기존 문의 데이터 불러오기
  useEffect(() => {
    const fetchInquiryDetail = async () => {
      try {
        const response = await fetch(`https://localhost/api/admininquiry/${id}`, {
          headers: {
            'Authorization': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title,
            content: data.content,
            inquiryType: data.inquiryType || 'NORMAL',
            projectId: data.projectId || ''
          });

          if (data.inquiryType === 'PROJECT') {
            const projectResponse = await fetch(`https://dev.vivim.co.kr/api/projects?userId=${decodedToken.userId}`, {
              headers: {
                'Authorization': token
              }
            });
            
            if (projectResponse.ok) {
              const projectData = await projectResponse.json();
              setProjects(projectData.filter(project => !project.deleted));
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        setIsLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [id]);

  // 문의 유형이 변경될 때마다 프로젝트 목록 업데이트
  useEffect(() => {
    const fetchProjects = async () => {
      if (formData.inquiryType === 'PROJECT') {
        try {
          const response = await fetch(`https://dev.vivim.co.kr/api/projects?userId=${decodedToken.userId}`, {
            headers: {
              'Authorization': token
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setProjects(data.filter(project => !project.deleted));
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      }
    };

    fetchProjects();
  }, [formData.inquiryType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://localhost/api/admininquiry/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('문의가 성공적으로 수정되었습니다.');
        navigate(`/admin-inquiry-list/${id}`);
      } else {
        alert('문의 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('문의 수정 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Navbar 
          activeMenuItem={activeMenuItem}
          handleMenuClick={setActiveMenuItem}
        />
        <MainContent>
          <LoadingContainer>
            데이터를 불러오는 중입니다...
          </LoadingContainer>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={setActiveMenuItem}
      />
      <MainContent>
        <Header>
          <BackButton onClick={() => navigate(-1)}>← 돌아가기</BackButton>
          <PageTitle>문의 수정</PageTitle>
        </Header>
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>문의 유형</Label>
            <Select 
              name="inquiryType"
              defaultValue={formData.inquiryType}
              onChange={handleChange}
            >
              <option value="NORMAL">일반 문의</option>
              <option value="PROJECT">프로젝트 문의</option>
            </Select>
          </FormGroup>

          {formData.inquiryType === 'PROJECT' && (
            <FormGroup>
              <Label>프로젝트</Label>
              <Select
                name="projectId"
                defaultValue="1"
                onChange={handleChange}
              >
                <option value="">프로젝트를 선택해주세요</option>
                {projects.map(project => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          )}

          <FormGroup>
            <Label>제목</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>내용</Label>
            <TextArea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
            />
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate(-1)}>
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

// 스타일 컴포넌트 추가
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.main`
  padding: 32px;
  margin-top: 60px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 15px;
  cursor: pointer;
  padding: 8px 0;
  
  &:hover {
    color: #2E7D32;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
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
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
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
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 10px 20px;
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
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 16px;
  color: #64748b;
`;

export default AdminInquiryEdit; 