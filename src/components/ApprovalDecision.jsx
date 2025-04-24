import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { ApprovalDecisionStatus } from '../constants/enums';

// Styled Components
const ResponseSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`;

const ResponseTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResponseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResponseItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
  position: relative;
  display: flex;
  
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    background-color: ${props => {
      if (props.hasApproved) return '#16a34a';
      if (props.hasRejected) return '#dc2626';
      return '#94a3b8';
    }};
  }

  & > div {
    flex: 1;
    margin-left: 4px;
  }
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const ResponseStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
`;

const ResponseName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ResponseDate = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ResponseContent = styled.div`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ResponseStatus = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  background-color: ${props => {
    const status = props.status;
    switch (status) {
      case ApprovalDecisionStatus.APPROVED:
        return '#dcfce7';
      case ApprovalDecisionStatus.REJECTED:
        return '#fee2e2';
      default:
        return '#f1f5f9';
    }
  }};
  color: ${props => {
    const status = props.status;
    switch (status) {
      case ApprovalDecisionStatus.APPROVED:
        return '#16a34a';
      case ApprovalDecisionStatus.REJECTED:
        return '#dc2626';
      default:
        return '#64748b';
    }
  }};
`;

const ResponseText = styled.div`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  flex: 1;
  text-align: left;
  
  strong {
    font-weight: 500;
    color: #1e293b;
  }
`;

const EmptyResponseMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin: 12px 0;
`;

const ResponseButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: #2E7D32;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;

  &:hover {
    background: #1B5E20;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  box-sizing: border-box;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }

  option {
    padding: 12px;
  }
`;

const CancelButton = styled(ResponseButton)`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const SaveButton = styled(ResponseButton)`
  background: #2E7D32;
  color: white;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #1B5E20;
  }
`;

const DeleteButton = styled.button`
  padding: 4px 8px;
  background: #fee2e2;
  border: none;
  border-radius: 4px;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fecaca;
  }
`;

const CompletedBadge = styled.span`
  background-color: #dcfce7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #16a34a;
  margin-left: 8px;
`;

const CompletedMessage = styled.div`
  padding: 12px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

// 승인권자 모달 관련 스타일 컴포넌트 추가
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const CompanyList = styled.div`
  margin-top: 16px;
  margin-bottom: 24px;
`;

const CompanyItem = styled.div`
  margin-bottom: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const CompanyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  cursor: pointer;
  
  &:hover {
    background-color: #eee;
  }
`;

const CompanyName = styled.div`
  font-weight: 600;
`;

const EmployeeList = styled.div`
  padding: 8px 12px;
  border-top: 1px solid #eee;
`;

const EmployeeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0;
`;

const EmployeeCheckbox = styled.input`
  margin-right: 12px;
`;

const EmployeeName = styled.span`
  margin-right: 8px;
`;

const SelectedApprovers = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const SelectedApproverList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SelectedApproverItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
`;

const RemoveApproverButton = styled.button`
  background: none;
  border: none;
  color: #666;
  margin-left: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    color: #333;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`;

const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: #0069d9;
  }
`;

const ApprovalDecision = ({ approvalId }) => {
  const [approversData, setApproversData] = useState([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [newDecision, setNewDecision] = useState({ content: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [expandedApprovers, setExpandedApprovers] = useState(new Set());
  
  // 승인권자 수정 관련 상태
  const [isEditApproversModalOpen, setIsEditApproversModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyEmployees, setCompanyEmployees] = useState({});
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [currentApprovers, setCurrentApprovers] = useState([]);

  useEffect(() => {
    fetchDecisions();
  }, [approvalId]);

  const fetchDecisions = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      const response = await fetch(API_ENDPOINTS.DECISION.LIST(approvalId), {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched decisions:', data);
      
      // 새로운 API 응답 구조에 맞게 데이터 처리
      const approvers = data.decisionResponses || [];
      setApproversData(approvers);
    } catch (error) {
      console.error('Error fetching decisions:', error);
      alert(error.message || '승인응답 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleCreateDecision = async () => {
    if (!newDecision.status) {
      alert('승인 상태를 선택해주세요.');
      return;
    }

    try {
      const storedToken = localStorage.getItem('token');
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      
      // 백엔드 엔드포인트 /approver/{approverId}/decision 사용
      const response = await fetch(API_ENDPOINTS.DECISION.CREATE_WITH_APPROVER(selectedApprover.approverId), {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          content: newDecision.content,
          decisionStatus: newDecision.status
          // approverId는 URL에 이미 포함되어 있으므로 본문에서 제거
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Create decision response:', data);
      
      if (data.statusCode === 201) {
        // 성공적으로 생성됨
        alert(data.statusMessage || '승인응답이 성공적으로 생성되었습니다.');
      }

      setIsInputOpen(false);
      setNewDecision({ content: '', status: '' });
      setSelectedApprover(null);
      await fetchDecisions();
    } catch (error) {
      console.error('Error creating decision:', error);
      alert(error.message || '승인응답 생성에 실패했습니다.');
    }
  };

  const handleDeleteDecision = async (decisionId) => {
    if (!window.confirm('정말로 이 응답을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const storedToken = localStorage.getItem('token');
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      const response = await fetch(API_ENDPOINTS.DECISION.DELETE(decisionId), {
        method: 'DELETE',
        headers: {
          'Authorization': authToken,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      if (data.statusCode === 200) {
        // 성공적으로 삭제됨
        alert(data.statusMessage || '승인응답이 성공적으로 삭제되었습니다.');
      }

      await fetchDecisions();
    } catch (error) {
      console.error('Error deleting decision:', error);
      alert(error.message || '응답 삭제에 실패했습니다.');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ApprovalDecisionStatus.APPROVED:
        return '승인';
      case ApprovalDecisionStatus.REJECTED:
        return '거절';
      default:
        return '대기중';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const hasApprovedDecision = (approver) => {
    return approver.decisionResponses?.some(
      decision => decision.status === ApprovalDecisionStatus.APPROVED
    );
  };

  const hasRejectedDecision = (approver) => {
    return approver.decisionResponses?.some(
      decision => decision.status === ApprovalDecisionStatus.REJECTED
    );
  };

  const sortApprovers = (approvers) => {
    return [...approvers].sort((a, b) => {
      const aCompleted = hasApprovedDecision(a);
      const bCompleted = hasApprovedDecision(b);
      if (aCompleted === bCompleted) return 0;
      return aCompleted ? 1 : -1;
    });
  };

  const toggleApproverExpansion = (approverId) => {
    setExpandedApprovers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(approverId)) {
        newSet.delete(approverId);
      } else {
        newSet.add(approverId);
      }
      return newSet;
    });
  };

  // 회사 목록 조회
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.COMPANY.LIST, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('회사 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setCompanies(data.companyList || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert(error.message);
      setLoading(false);
    }
  };

  // 회사 토글 및 직원 목록 조회
  const toggleCompany = async (company) => {
    const companyId = company.id;
    
    // 이미 확장된 회사면 접기
    if (expandedCompanies.has(companyId)) {
      setExpandedCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
      return;
    }
    
    // 이미 직원 목록이 있으면 확장만 하기
    if (companyEmployees[companyId]) {
      setExpandedCompanies(prev => new Set([...prev, companyId]));
      return;
    }
    
    // 직원 목록 조회
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.COMPANY.MEMBERS(companyId), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('직원 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setCompanyEmployees(prev => ({
        ...prev,
        [companyId]: data.memberList || []
      }));
      
      // 회사 확장 상태 업데이트
      setExpandedCompanies(prev => new Set([...prev, companyId]));
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert(error.message);
    }
  };

  // 승인권자 선택/해제
  const handleSelectApprover = (employee, checked) => {
    if (checked) {
      // 중복 체크
      const isDuplicate = selectedApprovers.some(approver => approver.memberId === employee.id);
      if (!isDuplicate) {
        setSelectedApprovers(prev => [...prev, {
          memberId: employee.id,
          memberName: employee.name,
          companyId: employee.companyId,
          companyName: companies.find(company => company.id === employee.companyId)?.name || ''
        }]);
      }
    } else {
      // 선택 해제
      setSelectedApprovers(prev => prev.filter(approver => approver.memberId !== employee.id));
    }
  };

  // 승인권자 제거
  const handleRemoveApprover = (memberId) => {
    setSelectedApprovers(prev => prev.filter(approver => approver.memberId !== memberId));
  };

  // 승인권자 수정 모달 열기
  const openEditApproversModal = () => {
    // 현재 승인권자 정보를 초기 선택 상태로 설정
    setCurrentApprovers(approversData.map(approver => ({
      memberId: approver.memberId,
      memberName: approver.approverName,
      approverId: approver.approverId
    })));
    
    // 기존 승인권자를 선택된 승인권자로 설정
    setSelectedApprovers(approversData.map(approver => ({
      memberId: approver.memberId,
      memberName: approver.approverName,
      approverId: approver.approverId
    })));
    
    setIsEditApproversModalOpen(true);
  };

  // 승인권자 수정 저장
  const handleSaveApprovers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // API 호출을 위한 승인권자 ID 목록
      const approverIds = selectedApprovers.map(approver => approver.memberId);
      
      const response = await fetch(API_ENDPOINTS.APPROVAL.UPDATE_APPROVERS(approvalId), {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approverIds: approverIds
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`승인권자 수정 실패: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.statusCode === 200) {
        setIsEditApproversModalOpen(false);
        fetchDecisions(); // 승인권자 목록 다시 조회
        alert('승인권자가 성공적으로 수정되었습니다.');
      } else {
        throw new Error(result.statusMessage || '승인권자 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating approvers:', error);
      alert(error.message);
    }
  };

  // 모달이 열릴 때 회사 목록 조회
  useEffect(() => {
    if (isEditApproversModalOpen) {
      fetchCompanies();
    } else {
      setCompanies([]);
      setCompanyEmployees({});
      setExpandedCompanies(new Set());
      // 선택된 승인권자는 초기화하지 않음 (이미 설정된 상태 유지)
    }
  }, [isEditApproversModalOpen]);

  return (
    <>
      <ResponseSection>
        <ActionButtonContainer>
          <ActionButton onClick={openEditApproversModal}>
            승인권자 수정
          </ActionButton>
        </ActionButtonContainer>
        <ResponseList>
          {approversData.length === 0 ? (
            <EmptyResponseMessage>승인권자가 없습니다.</EmptyResponseMessage>
          ) : (
            sortApprovers(approversData).map((approver) => (
              <ResponseItem 
                key={approver.approverId}
                hasApproved={hasApprovedDecision(approver)}
                hasRejected={hasRejectedDecision(approver)}
                isCompleted={hasApprovedDecision(approver)}
              >
                <div>
                  <ResponseHeader>
                    <ResponseName>
                      {approver.approverName}
                      {hasApprovedDecision(approver) && (
                        <CompletedBadge>승인 완료</CompletedBadge>
                      )}
                    </ResponseName>
                  </ResponseHeader>
                  {hasApprovedDecision(approver) ? (
                    <>
                      <CompletedMessage 
                        onClick={() => toggleApproverExpansion(approver.approverId)}
                      >
                        지난 응답내역 다시보기
                      </CompletedMessage>
                      {expandedApprovers.has(approver.approverId) && (
                        <>
                          {approver.decisionResponses.map((decision) => (
                            <div key={decision.id} style={{ marginBottom: '16px' }}>
                              <ResponseHeader>
                                <ResponseStatusContainer>
                                  <ResponseStatus status={decision.status}>
                                    {getStatusText(decision.status)}
                                  </ResponseStatus>
                                </ResponseStatusContainer>
                                <ResponseDate>{formatDate(decision.decidedAt)}</ResponseDate>
                              </ResponseHeader>
                              <ResponseContent>
                                <ResponseText>
                                  {decision.title && <strong>{decision.title}</strong>}
                                  {decision.content && <div>{decision.content}</div>}
                                  {!decision.title && !decision.content && '내용 없음'}
                                </ResponseText>
                              </ResponseContent>
                              <ResponseActionsContainer>
                                <DeleteButton onClick={() => handleDeleteDecision(decision.id)}>
                                  삭제
                                </DeleteButton>
                              </ResponseActionsContainer>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {approver.decisionResponses && approver.decisionResponses.length > 0 ? (
                        <>
                          {approver.decisionResponses.map((decision) => (
                            <div key={decision.id} style={{ marginBottom: '16px' }}>
                              <ResponseHeader>
                                <ResponseStatusContainer>
                                  <ResponseStatus status={decision.status}>
                                    {getStatusText(decision.status)}
                                  </ResponseStatus>
                                </ResponseStatusContainer>
                                <ResponseDate>{formatDate(decision.decidedAt)}</ResponseDate>
                              </ResponseHeader>
                              <ResponseContent>
                                <ResponseText>
                                  {decision.title && <strong>{decision.title}</strong>}
                                  {decision.content && <div>{decision.content}</div>}
                                  {!decision.title && !decision.content && '내용 없음'}
                                </ResponseText>
                              </ResponseContent>
                              <ResponseActionsContainer>
                                <DeleteButton onClick={() => handleDeleteDecision(decision.id)}>
                                  삭제
                                </DeleteButton>
                              </ResponseActionsContainer>
                            </div>
                          ))}
                          {isInputOpen && selectedApprover?.approverId === approver.approverId ? (
                            <div style={{ marginTop: '16px', width: '100%' }}>
                              <InputGroup>
                                <Label>응답 내용</Label>
                                <TextArea
                                  value={newDecision.content}
                                  onChange={(e) => setNewDecision(prev => ({
                                    ...prev,
                                    content: e.target.value
                                  }))}
                                  placeholder="응답 내용을 입력하세요"
                                />
                              </InputGroup>
                              <InputGroup>
                                <Label>승인 상태</Label>
                                <StatusSelect
                                  value={newDecision.status}
                                  onChange={(e) => setNewDecision(prev => ({
                                    ...prev,
                                    status: e.target.value
                                  }))}
                                >
                                  <option value="">승인 상태를 선택하세요</option>
                                  <option value={ApprovalDecisionStatus.APPROVED}>승인</option>
                                  <option value={ApprovalDecisionStatus.REJECTED}>거절</option>
                                </StatusSelect>
                              </InputGroup>
                              <ResponseActionsContainer>
                                <CancelButton onClick={() => {
                                  setIsInputOpen(false);
                                  setSelectedApprover(null);
                                  setNewDecision({ content: '', status: '' });
                                }}>취소</CancelButton>
                                <SaveButton onClick={handleCreateDecision}>저장</SaveButton>
                              </ResponseActionsContainer>
                            </div>
                          ) : (
                            <ResponseButton onClick={() => {
                              setIsInputOpen(true);
                              setSelectedApprover(approver);
                              setNewDecision({ content: '', status: '' });
                            }}>
                              <span>+</span>
                              <span>승인응답 추가</span>
                            </ResponseButton>
                          )}
                        </>
                      ) : (
                        <>
                          <EmptyResponseMessage>아직 응답이 없습니다.</EmptyResponseMessage>
                          {isInputOpen && selectedApprover?.approverId === approver.approverId ? (
                            <div style={{ marginTop: '16px', width: '100%' }}>
                              <InputGroup>
                                <Label>응답 내용</Label>
                                <TextArea
                                  value={newDecision.content}
                                  onChange={(e) => setNewDecision(prev => ({
                                    ...prev,
                                    content: e.target.value
                                  }))}
                                  placeholder="응답 내용을 입력하세요"
                                />
                              </InputGroup>
                              <InputGroup>
                                <Label>승인 상태</Label>
                                <StatusSelect
                                  value={newDecision.status}
                                  onChange={(e) => setNewDecision(prev => ({
                                    ...prev,
                                    status: e.target.value
                                  }))}
                                >
                                  <option value="">승인 상태를 선택하세요</option>
                                  <option value={ApprovalDecisionStatus.APPROVED}>승인</option>
                                  <option value={ApprovalDecisionStatus.REJECTED}>거절</option>
                                </StatusSelect>
                              </InputGroup>
                              <ResponseActionsContainer>
                                <CancelButton onClick={() => {
                                  setIsInputOpen(false);
                                  setSelectedApprover(null);
                                  setNewDecision({ content: '', status: '' });
                                }}>취소</CancelButton>
                                <SaveButton onClick={handleCreateDecision}>저장</SaveButton>
                              </ResponseActionsContainer>
                            </div>
                          ) : (
                            <ResponseButton onClick={() => {
                              setIsInputOpen(true);
                              setSelectedApprover(approver);
                              setNewDecision({ content: '', status: '' });
                            }}>
                              <span>+</span>
                              <span>승인응답 추가</span>
                            </ResponseButton>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </ResponseItem>
            ))
          )}
        </ResponseList>
      </ResponseSection>

      {/* 승인권자 수정 모달 */}
      {isEditApproversModalOpen && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <ModalTitle>승인권자 수정</ModalTitle>
              <CloseButton onClick={() => setIsEditApproversModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <CompanyList>
              {loading ? (
                <div>회사 목록을 불러오는 중...</div>
              ) : (
                companies.map(company => (
                  <CompanyItem key={company.id}>
                    <CompanyHeader onClick={() => toggleCompany(company)}>
                      <CompanyName>{company.name}</CompanyName>
                      <span>{expandedCompanies.has(company.id) ? '▼' : '▶'}</span>
                    </CompanyHeader>
                    
                    {expandedCompanies.has(company.id) && (
                      <EmployeeList>
                        {companyEmployees[company.id]?.map(employee => (
                          <EmployeeItem key={employee.id}>
                            <EmployeeCheckbox 
                              type="checkbox"
                              checked={selectedApprovers.some(approver => approver.memberId === employee.id)}
                              onChange={(e) => handleSelectApprover(employee, e.target.checked)}
                            />
                            <EmployeeName>{employee.name}</EmployeeName>
                            <span style={{ fontSize: '12px', color: '#666' }}>{employee.email}</span>
                          </EmployeeItem>
                        ))}
                      </EmployeeList>
                    )}
                  </CompanyItem>
                ))
              )}
            </CompanyList>
            
            <SelectedApprovers>
              <div>선택된 승인권자 ({selectedApprovers.length}명)</div>
              <SelectedApproverList>
                {selectedApprovers.map(approver => (
                  <SelectedApproverItem key={approver.memberId}>
                    {approver.memberName}
                    <RemoveApproverButton onClick={() => handleRemoveApprover(approver.memberId)}>
                      ×
                    </RemoveApproverButton>
                  </SelectedApproverItem>
                ))}
              </SelectedApproverList>
            </SelectedApprovers>
            
            <ModalButtonContainer>
              <CancelButton onClick={() => setIsEditApproversModalOpen(false)}>
                취소
              </CancelButton>
              <SaveButton onClick={handleSaveApprovers}>
                저장
              </SaveButton>
            </ModalButtonContainer>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default ApprovalDecision; 