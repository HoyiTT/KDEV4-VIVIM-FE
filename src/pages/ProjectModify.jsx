import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

const ProjectModify = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // URL에서 프로젝트 ID 가져오기
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  
  // 폼 상태 관리
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectType, setProjectType] = useState('웹사이트');
  const [projectStage, setProjectStage] = useState('기획');
  const [projectStatus, setProjectStatus] = useState('진행중');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState([{ name: '', role: '', email: '' }]);
  const [loading, setLoading] = useState(true);

  // 프로젝트 데이터 불러오기 (실제 구현 시 API 호출로 대체)
  useEffect(() => {
    // 여기서 API를 호출하여 프로젝트 데이터를 가져옵니다
    // 예시 데이터로 대체
    setTimeout(() => {
      setProjectName('웹사이트 리뉴얼');
      setClientName('가이던테크');
      setStartDate('2025-01-15');
      setEndDate('2025-04-15');
      setProjectType('웹사이트');
      setProjectStage('디자인');
      setProjectStatus('진행중');
      setDescription('가이던테크 웹사이트 리뉴얼 프로젝트입니다. 반응형 디자인으로 개선하고 사용자 경험을 향상시키는 것이 목표입니다.');
      setTeamMembers([
        { name: '김철수', role: '프로젝트 매니저', email: 'kim@example.com' },
        { name: '이영희', role: '디자이너', email: 'lee@example.com' },
        { name: '박지훈', role: '개발자', email: 'park@example.com' }
      ]);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', role: '', email: '' }]);
  };

  const handleRemoveTeamMember = (index) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers.splice(index, 1);
    setTeamMembers(newTeamMembers);
  };

  const handleTeamMemberChange = (index, field, value) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index][field] = value;
    setTeamMembers(newTeamMembers);
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PROJECT_DETAIL(projectId), {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      
      // Update form data with fetched project data
      setProjectName(data.name);
      setClientName(data.clientName);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setProjectType(data.projectType || '웹사이트');
      setProjectStage(data.projectStage || '기획');
      setProjectStatus(data.status || '진행중');
      setDescription(data.description);
      setTeamMembers(data.teamMembers || [{ name: '', role: '', email: '' }]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PROJECT_DETAIL(projectId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          name: projectName,
          clientName,
          startDate,
          endDate,
          projectType,
          projectStage,
          status: projectStatus,
          description,
          teamMembers
        })
      });

      if (response.ok) {
        alert('프로젝트가 성공적으로 수정되었습니다.');
        navigate('/dashboard');
      } else {
        alert('프로젝트 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('프로젝트 수정 중 오류가 발생했습니다.');
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
          <PageTitle>프로젝트 수정</PageTitle>
          <ProfileContainer>
            <ProfileImage src="https://via.placeholder.com/40" alt="Profile" />
          </ProfileContainer>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>기본 정보</SectionTitle>
            
            <FormGroup>
              <Label htmlFor="projectName">프로젝트명</Label>
              <Input 
                id="projectName" 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="clientName">고객사</Label>
              <Input 
                id="clientName" 
                type="text" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="startDate">시작일</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="endDate">종료 예정일</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <SectionDivider />
          
          <FormSection>
            <SectionTitle>프로젝트 상세</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="projectType">프로젝트 유형</Label>
                <Select 
                  id="projectType" 
                  value={projectType} 
                  onChange={(e) => setProjectType(e.target.value)}
                >
                  <option value="웹사이트">웹사이트</option>
                  <option value="모바일앱">모바일앱</option>
                  <option value="API개발">API개발</option>
                  <option value="시스템통합">시스템통합</option>
                  <option value="기타">기타</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="projectStage">현재 단계</Label>
                <Select 
                  id="projectStage" 
                  value={projectStage} 
                  onChange={(e) => setProjectStage(e.target.value)}
                >
                  <option value="기획">기획</option>
                  <option value="디자인">디자인</option>
                  <option value="개발">개발</option>
                  <option value="테스트">테스트</option>
                  <option value="배포">배포</option>
                  <option value="유지보수">유지보수</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="projectStatus">상태</Label>
                <Select 
                  id="projectStatus" 
                  value={projectStatus} 
                  onChange={(e) => setProjectStatus(e.target.value)}
                >
                  <option value="진행중">진행중</option>
                  <option value="승인대기">승인대기</option>
                  <option value="마감임박">마감임박</option>
                  <option value="완료">완료</option>
                  <option value="보류">보류</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label htmlFor="description">프로젝트 설명</Label>
              <TextArea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </FormGroup>
          </FormSection>
          
          <SectionDivider />
          
          <FormSection>
            <SectionTitle>팀 구성</SectionTitle>
            
            {teamMembers.map((member, index) => (
              <TeamMemberRow key={index}>
                <FormGroup>
                  <Label htmlFor={`memberName${index}`}>이름</Label>
                  <Input 
                    id={`memberName${index}`} 
                    type="text" 
                    value={member.name} 
                    onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor={`memberRole${index}`}>역할</Label>
                  <Input 
                    id={`memberRole${index}`} 
                    type="text" 
                    value={member.role} 
                    onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor={`memberEmail${index}`}>이메일</Label>
                  <Input 
                    id={`memberEmail${index}`} 
                    type="email" 
                    value={member.email} 
                    onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                  />
                </FormGroup>
                
                {teamMembers.length > 1 && (
                  <RemoveButton 
                    type="button" 
                    onClick={() => handleRemoveTeamMember(index)}
                  >
                    삭제
                  </RemoveButton>
                )}
              </TeamMemberRow>
            ))}
            
            <AddButton type="button" onClick={handleAddTeamMember}>
              팀원 추가
            </AddButton>
          </FormSection>
          
          <ButtonContainer>
            <CancelButton type="button" onClick={() => navigate('/dashboard')}>
              취소
            </CancelButton>
            <SubmitButton type="submit">
              프로젝트 수정
            </SubmitButton>
          </ButtonContainer>
        </FormContainer>
      </MainContent>
    </PageContainer>
  );
};

// Update styled components
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
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
`;

const FormContainer = styled.form`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: #e2e8f0;
  margin: 24px 0;
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  
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
  transition: border-color 0.2s;
  
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
  min-height: 100px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const TeamMemberRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const RemoveButton = styled.button`
  padding: 12px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    background: #fee2e2;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`;

const AddButton = styled.button`
  padding: 12px 16px;
  background: transparent;
  color: #2E7D32;
  border: 1px solid #2E7D32;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(46, 125, 50, 0.1);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1B5E20;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 18px;
  color: #64748b;
`;

export default ProjectModify;