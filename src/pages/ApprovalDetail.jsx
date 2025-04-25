import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import ApprovalDecision from '../components/ApprovalDecision';
import { ApprovalDecisionStatus } from '../constants/enums';
import ProjectStageProgress from '../components/ProjectStageProgress';

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0 270px;
  @media (max-width: 1400px) {
    padding: 0 10%;
  }
  
  @media (max-width: 768px) {
    padding: 0 5%;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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

const ContentContainer = styled.div`
  background: #f5f7fa;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const ProposalTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  text-align: center;
`;

const ProposalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const InfoItem = styled.div`
  display: flex;
  gap: 16px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  min-width: 80px;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #1e293b;
`;

const ContentSection = styled.div`
  font-size: 16px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 70px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ProposalSubtitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  ${props => props.withMargin && `
    margin-top: 32px;
  `}
`;

const ResponseStatus = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'APPROVED':
        return '#dcfce7';
      case 'REJECTED':
        return '#fee2e2';
      case 'BEFORE_REQUEST_PROPOSAL':
        return '#f1f5f9';
      case 'REQUEST_PROPOSAL':
        return '#dbeafe';
      default:
        return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'APPROVED':
        return '#16a34a';
      case 'REJECTED':
        return '#dc2626';
      case 'BEFORE_REQUEST_PROPOSAL':
        return '#64748b';
      case 'REQUEST_PROPOSAL':
        return '#2563eb';
      default:
        return '#64748b';
    }
  }};
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #ef4444;
`;

const ApprovalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('진행중인 프로젝트');
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [projectId, setProjectId] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetchProposalDetail();
  }, [id]);

  // 프로젝트 진행 상태 조회
  useEffect(() => {
    if (projectId) {
      console.log("프로젝트 ID 감지됨:", projectId);
      fetchProjectProgress();
    }
  }, [projectId]);

  const fetchProposalDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("승인요청 상세 조회 시작:", id);
      
      const response = await fetch(API_ENDPOINTS.APPROVAL.DETAIL(id), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('승인요청 상세 조회에 실패했습니다.');
      }

      const data = await response.json();
      console.log("승인요청 데이터:", data);
      setProposal(data);
      
      // 프로젝트 ID 설정
      if (data.projectId) {
        console.log("프로젝트 ID 설정:", data.projectId);
        setProjectId(data.projectId);
      } else {
        console.error("승인요청에 프로젝트 ID가 없습니다");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposal detail:', error);
      setError('승인요청 상세 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // 프로젝트 진행 단계 조회
  const fetchProjectProgress = async () => {
    try {
      setProgressLoading(true);
      const token = localStorage.getItem('token');
      console.log("프로젝트 진행 단계 조회 시작:", projectId);
      
      const response = await fetch(`${API_ENDPOINTS.PROJECT_DETAIL(projectId)}/progress`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        throw new Error('프로젝트 진행 상태 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log("프로젝트 진행 단계 데이터:", data);
      
      if (data.progressList && data.progressList.length > 0) {
        setProgressList(data.progressList);
        console.log("프로젝트 진행 단계 설정 완료:", data.progressList.length, "개 항목");
        
        // 승인 요청이 속한 단계 찾기
        const stageIndex = data.progressList.findIndex(
          stage => stage.id === proposal.progressId
        );
        
        if (stageIndex >= 0) {
          console.log("현재 단계 찾음:", stageIndex, data.progressList[stageIndex].name);
          setCurrentStageIndex(stageIndex);
        } else {
          console.log("승인요청의 단계를 찾지 못함. progressId:", proposal.progressId);
        }
      } else {
        console.log("프로젝트 진행 단계 데이터가 없거나 비어있습니다");
      }
      setProgressLoading(false);
    } catch (error) {
      console.error('Error fetching project progress:', error);
      setProgressLoading(false);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'BEFORE_REQUEST_PROPOSAL':
        return '요청전';
      case 'REQUEST_PROPOSAL':
        return '요청 중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <ContentWrapper>
        <MainContent>
          <Header>
            <PageTitle>승인요청 상세보기</PageTitle>
            <BackButton onClick={handleBack}>
              ← 돌아가기
            </BackButton>
          </Header>

          {loading ? (
            <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : proposal ? (
            <>
              {/* 프로젝트 단계 진행 상황 표시 */}
              {progressLoading ? (
                <div style={{ marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                  <p>프로젝트 진행 단계를 불러오는 중...</p>
                </div>
              ) : progressList && progressList.length > 0 ? (
                <div style={{ marginBottom: '24px' }}>
                  <ProjectStageProgress 
                    progressList={progressList}
                    currentStageIndex={currentStageIndex}
                    setCurrentStageIndex={setCurrentStageIndex}
                    title="프로젝트 진행 단계"
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                  <p>이 승인요청에 대한 프로젝트 진행 단계 정보가 없습니다.</p>
                </div>
              )}
              
              <ContentContainer>
                <ProposalTitle>{proposal.title}</ProposalTitle>
                <ProposalInfo>
                  <InfoItem>
                    <InfoLabel>작성자</InfoLabel>
                    <InfoValue>{proposal.creator?.name} ({proposal.creator?.companyName})</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>작성일</InfoLabel>
                    <InfoValue>{formatDate(proposal.createdAt)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>상태</InfoLabel>
                    <InfoValue>
                      <ResponseStatus status={proposal.approvalProposalStatus}>
                        {getStatusText(proposal.approvalProposalStatus)}
                      </ResponseStatus>
                    </InfoValue>
                  </InfoItem>
                </ProposalInfo>
                <ContentSection>
                  {proposal.content}
                </ContentSection>
                <ApprovalDecision approvalId={proposal.id} />
              </ContentContainer>
            </>
          ) : (
            <ErrorMessage>승인요청을 찾을 수 없습니다.</ErrorMessage>
          )}
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ApprovalDetail; 