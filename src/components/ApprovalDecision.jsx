import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { ApprovalDecisionStatus } from '../constants/enums';

// Styled Components
const ResponseSection = styled.div`
  margin-top: 16px;
  padding: 24px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
`;

const ResponseTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResponseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResponseItem = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    background-color: ${props => {
      if (props.$hasApproved) return '#16a34a';
      if (props.$hasRejected) return '#dc2626';
      return '#94a3b8';
    }};
  }

  & > div {
    flex: 1;
    margin-left: 6px;
  }
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const ResponseStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResponseActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
`;

const ResponseName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseDate = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const ResponseContent = styled.div`
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 4px 0;
`;

const ResponseStatus = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
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
  font-size: 15px;
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
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 15px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  margin: 16px 0;
`;

const ResponseButton = styled.button`
  width: 100%;
  padding: 10px 18px;
  background: #2E7D32;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  font-weight: 500;

  &:hover {
    background: #1B5E20;
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  background: white;
  padding: 24px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  box-sizing: border-box;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 15px;
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
  font-size: 15px;
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

const CancelButton = styled.button`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e2e8f0;
    color: #1e293b;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  background: #2E7D32;
  color: white;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1B5E20;
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #fee2e2;
  border: none;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fecaca;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
  }
`;

const CompletedBadge = styled.span`
  background-color: #dcfce7;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #16a34a;
  margin-left: 10px;
`;

const CompletedMessage = styled.div`
  padding: 14px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

// 승인권자 헤더와 편집 버튼을 위한 스타일
const ApproversSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
`;

const ApproversSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const ApproversHeaderButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const EditApproversButton = styled.button`
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #1B5E20;
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SendApprovalButton = styled.button`
  background: #1E40AF;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #1E3A8A;
    box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// 승인권자 모달 관련 스타일 컴포넌트
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
  padding: 28px;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
    color: #334155;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CompanyList = styled.div`
  margin-top: 16px;
  margin-bottom: 24px;
`;

const CompanyItem = styled.div`
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const CompanyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

const CompanyName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
`;

const EmployeeList = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  background-color: white;
`;

const EmployeeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EmployeeCheckbox = styled.input`
  margin-right: 12px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #2E7D32;
  
  &:checked {
    background-color: #2E7D32;
    border-color: #2E7D32;
  }
`;

const EmployeeName = styled.span`
  margin-right: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
`;

const SelectedApprovers = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SelectedApproverList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
`;

const SelectedApproverItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #cbd5e1;
  }
`;

const RemoveApproverButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  margin-left: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #dc2626;
  }
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

// 로딩 표시 컴포넌트
const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: #64748b;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-radius: 50%;
    border-top-color: #2E7D32;
    animation: spinner 0.8s linear infinite;
  }
  
  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }
`;

// 모달 내용 컨테이너
const ModalContent = styled.div`
  padding: 16px 0;
  position: relative;
  min-height: 200px;
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
    // 디버깅을 위해 approvalId 로깅
    console.log('ApprovalDecision 컴포넌트 마운트, approvalId:', approvalId, '타입:', typeof approvalId);
  }, [approvalId]);

  const fetchDecisions = async () => {
    try {
      // 디버깅을 위해 approvalId 로깅
      console.log('fetchDecisions 호출, approvalId:', approvalId);
      
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

  const handleDeleteDecision = async (decisionId, status, approverId, approverName) => {
    // 승인 결정 삭제 전 확인
    const statusText = status === ApprovalDecisionStatus.APPROVED ? '승인' : 
                      status === ApprovalDecisionStatus.REJECTED ? '거절' : '대기중';
    
    const confirmMessage = `${approverName}님의 "${statusText}" 응답을 삭제하시겠습니까?\n\n이 작업은 취소할 수 없으며, 삭제 후에는 승인권자가 새로운 응답을 등록해야 합니다.`;
    
    if (!window.confirm(confirmMessage)) {
      console.log('승인 응답 삭제 취소됨');
      return;
    }

    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      
      console.log(`승인 응답 삭제 요청: 결정 ID ${decisionId}, 승인권자 ${approverName}`);
      
      const response = await fetch(API_ENDPOINTS.DECISION.DELETE(decisionId), {
        method: 'DELETE',
        headers: {
          'Authorization': authToken,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('승인 응답 삭제 실패:', errorText);
        throw new Error(`응답 삭제 실패: ${response.status}`);
      }

      const data = await response.json();
      if (data.statusCode === 200 || response.status === 200) {
        alert('승인 응답이 성공적으로 삭제되었습니다.');
      }

      // 화면 새로고침
      await fetchDecisions();
    } catch (error) {
      console.error('승인 응답 삭제 오류:', error);
      alert(`승인 응답 삭제에 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
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
      
      // 승인권자 ID 목록 확인
      if (selectedApprovers && selectedApprovers.length > 0) {
        console.log('회사 목록 조회 시 선택된 승인권자 ID 목록:', 
          selectedApprovers.map(a => ({ id: a.memberId, name: a.memberName }))
        );
      }
      
      const response = await fetch(API_ENDPOINTS.COMPANIES, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error('회사 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 응답의 다양한 형태 처리
      const list = data.data ?? data.companies ?? data.companyList ?? data.items ?? (Array.isArray(data) ? data : []);
      // 고객사(CUSTOMER) 역할을 가진 회사만 필터링
      const customerCompanies = list.filter(c => c.companyRole?.toUpperCase() === 'CUSTOMER');
      
      console.log('고객사 목록:', customerCompanies);
      setCompanies(customerCompanies);
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
      const response = await fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(companyId), {
        headers: { 
          'Authorization': token, 
          'Content-Type': 'application/json',
          'accept': '*/*' 
        }
      });
      
      if (!response.ok) {
        throw new Error('직원 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      // 응답의 다양한 형태 처리
      const empList = data.data ?? data.employees ?? data.memberList ?? data.items ?? (Array.isArray(data) ? data : []);
      
      console.log(`회사 ID ${companyId}의 직원 목록:`, empList);
      
      // 직원 목록 저장 전 현재 선택된 승인권자 ID 목록 로깅
      if (selectedApprovers.length > 0) {
        console.log('현재 선택된 승인권자 ID 목록:', selectedApprovers.map(a => String(a.memberId)));
      }
      
      setCompanyEmployees(prev => ({
        ...prev,
        [companyId]: empList
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
    console.log(`승인권자 ${checked ? '선택' : '해제'} 시도:`, employee.name, employee.id);
    
    if (checked) {
      // 체크 시 처리 (승인권자 추가)
      // 직원 ID 문자열로 변환
      const employeeIdStr = String(employee.id);
      
      // 타입을 일관되게 문자열로 비교하여 중복 체크
      const isDuplicate = selectedApprovers.some(
        approver => String(approver.memberId) === employeeIdStr
      );
      
      if (!isDuplicate) {
        // 중복이 아닌 경우에만 추가
        const newApprover = {
          id: `${Date.now()}-${employee.id}`,
          memberId: employee.id,
          memberName: employee.name,
          companyId: employee.companyId,
          companyName: companies.find(company => company.id === employee.companyId)?.name || ''
        };
        
        setSelectedApprovers(prev => {
          const updated = [...prev, newApprover];
          console.log(`승인권자 추가 완료: ${employee.name}, 현재 총 ${updated.length}명`);
          return updated;
        });
      } else {
        console.log(`이미 선택된 승인권자입니다: ${employee.name} (ID: ${employee.id})`);
      }
    } else {
      // 체크 해제 시 확인 대화상자 표시
      if (!window.confirm(`"${employee.name}" 승인권자를 목록에서 제외하시겠습니까?\n제외 시 관련된 승인 응답 권한도 함께 제거됩니다.`)) {
        console.log('승인권자 체크 해제 취소됨');
        
        // 체크박스 상태를 원래대로 유지
        // 이 부분이 가장 중요: UI를 강제로 업데이트하여 체크박스가 다시 체크된 상태로 보이게 함
        // 리렌더링을 트리거하기 위해 상태 업데이트 (동일한 배열을 새 참조로)
        setSelectedApprovers(prev => [...prev]);
        return;
      }
      
      // 마지막 승인권자인 경우 추가 경고
      if (selectedApprovers.length <= 1) {
        if (!window.confirm('마지막 승인권자를 제외하면 모든 승인권자가 제거됩니다.\n정말로 계속하시겠습니까?')) {
          console.log('마지막 승인권자 체크 해제 취소됨');
          
          // 체크박스 상태를 원래대로 유지
          setSelectedApprovers(prev => [...prev]);
          return;
        }
        
        // 전체 삭제로 처리
        setSelectedApprovers([]);
        console.log(`마지막 승인권자 체크 해제: 전체 삭제 실행`);
        return;
      }
      
      // 선택 해제 - 문자열로 변환하여 비교
      const employeeIdStr = String(employee.id);
      
      setSelectedApprovers(prev => {
        const filtered = prev.filter(
          approver => String(approver.memberId) !== employeeIdStr
        );
        console.log(`승인권자 제거 완료: ${employee.name}, 남은 수: ${filtered.length}`);
        return filtered;
      });
    }
  };

  // 승인권자 제거
  const handleRemoveApprover = (memberId, memberName) => {
    // 삭제 전 확인 대화상자 표시
    if (!window.confirm(`"${memberName}" 승인권자를 정말로 삭제하시겠습니까?\n삭제 시 관련된 승인 응답도 함께 사라집니다.`)) {
      console.log('승인권자 삭제 취소됨');
      return;
    }
    
    // 마지막 승인권자인 경우 특별 경고
    if (selectedApprovers.length <= 1) {
      if (!window.confirm('마지막 승인권자를 삭제하면 모든 승인권자가 제거됩니다.\n정말로 계속하시겠습니까?')) {
        console.log('마지막 승인권자 삭제 취소됨');
        return;
      }
      
      // 전체 삭제 처리
      setSelectedApprovers([]);
      console.log('마지막 승인권자 제거: 전체 삭제 실행');
      return;
    }
    
    // 문자열로 비교하여 일관성 유지
    setSelectedApprovers(prev => prev.filter(approver => 
      String(approver.memberId) !== String(memberId)
    ));
    
    console.log(`승인권자 제거: ${memberName}(ID: ${memberId}), 남은 수: ${selectedApprovers.length - 1}`);
  };
  
  // 선택된 승인권자 목록의 "전체 삭제" 클릭 처리
  const handleRemoveAllApprovers = () => {
    // 전체 삭제 전 확인
    if (!window.confirm('모든 승인권자를 삭제하시겠습니까?\n이 작업은 취소할 수 없으며, 모든 승인 응답이 사라집니다.')) {
      console.log('전체 승인권자 삭제 취소됨');
      return;
    }
    
    setSelectedApprovers([]);
    console.log('모든 승인권자 삭제됨');
  };

  // 모든 승인권자 목록 조회 함수
  const fetchAllApprovers = async () => {
    try {
      if (!approvalId) {
        console.error('승인권자 조회 실패: 유효한 승인 ID가 없습니다.');
        setInitialApproversFromLocalData();
        return;
      }

      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }
      
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      const apiUrl = API_ENDPOINTS.APPROVAL.APPROVERS(approvalId);
      
      console.log(`승인권자 목록 조회 URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': authToken,
          'accept': '*/*'
        }
      });
      
      console.log(`승인권자 목록 조회 상태: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`승인권자 목록 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('승인권자 목록 응답:', responseText);
      
      // API 응답이 비어있는 경우 처리
      if (!responseText.trim()) {
        console.warn('승인권자 목록 응답이 비어있습니다.');
        setInitialApproversFromLocalData();
        return;
      }
      
      const data = JSON.parse(responseText);
      console.log('파싱된 승인권자 목록 데이터:', data);
      
      // API 응답 구조에 맞게 필드 접근 (approverResponses 필드에서 데이터 추출)
      const approverList = data.approverResponses || [];
      console.log('추출된 승인권자 목록:', approverList);
      
      if (approverList.length === 0) {
        console.warn('승인권자 목록이 비어있습니다.');
        setInitialApproversFromLocalData();
        return;
      }
      
      // 승인권자 데이터 처리
      const processedApprovers = processApproverData(approverList);
      console.log('처리된 승인권자 목록:', processedApprovers);
      
      setSelectedApprovers(processedApprovers);
    } catch (error) {
      console.error('승인권자 목록 조회 오류:', error);
      setInitialApproversFromLocalData();
    }
  };
  
  // 기존 데이터로 승인권자 초기화
  const setInitialApproversFromLocalData = () => {
    console.log('기존 승인권자 데이터 사용:', approversData);
    const processedApprovers = processApproverData(approversData);
    setSelectedApprovers(processedApprovers);
  };

  // 승인권자 데이터 처리 함수 (API 응답 구조에 맞게 수정)
  const processApproverData = (approvers) => {
    if (!approvers || approvers.length === 0) {
      return [];
    }
    
    // 응답 필드 구조 로깅
    const sampleApprover = approvers[0];
    console.log('승인권자 필드 구조 분석:', {
      approverId: sampleApprover.approverId,
      userId: sampleApprover.userId,
      memberId: sampleApprover.memberId,
      id: sampleApprover.id,
      name: sampleApprover.name,
      memberName: sampleApprover.memberName,
      approverName: sampleApprover.approverName,
      decisionStatus: sampleApprover.decisionStatus
    });
    
    // 중복 제거된 승인권자 목록 생성
    const uniqueApprovers = approvers.reduce((acc, approver) => {
      // API 응답에 따라 필드 이름 처리 (userId를 memberId로 매핑)
      const memberId = approver.userId || approver.memberId || approver.id;
      const memberName = approver.name || approver.memberName || approver.approverName || '이름 없음';
      
      // 중복 확인을 위한 키 생성
      const approverKey = String(memberId);
      
      if (memberId && !acc[approverKey]) {
        acc[approverKey] = {
          memberId: memberId,
          memberName: memberName,
          approverStatus: approver.decisionStatus || approver.approverStatus || 'PENDING',
          id: approver.approverId || approver.id || memberId  // approverId를 ID로 사용
        };
      }
      
      return acc;
    }, {});
    
    // 객체를 배열로 변환
    const result = Object.values(uniqueApprovers);
    console.log('처리된 승인권자 데이터:', result);
    
    return result;
  };

  // 승인권자 수정 모달 열기
  const openEditApproversModal = () => {
    // 승인 ID 검증
    if (!approvalId) {
      alert('유효한 승인 요청 ID가 없습니다.');
      return;
    }
    
    console.log('승인권자 수정 모달 열기, approvalId:', approvalId);
    
    // 초기화
    setSelectedApprovers([]);
    setExpandedCompanies(new Set());
    setCompanyEmployees({});
    
    // 승인권자 전체 목록 API 호출
    fetchAllApprovers();
    
    // 현재 승인권자 정보 저장 (로컬 데이터)
    setCurrentApprovers(approversData.map(approver => ({
      id: `${Date.now()}-${approver.memberId}`,
      memberId: approver.memberId,
      memberName: approver.approverName,
      approverId: approver.approverId
    })));
    
    // 모달 열기
    setIsEditApproversModalOpen(true);
  };

  // 선택된 승인권자인지 확인하는 함수
  const isApproverSelected = (employeeId) => {
    if (!selectedApprovers || selectedApprovers.length === 0) return false;
    
    const employeeIdStr = String(employeeId);
    return selectedApprovers.some(approver => 
      String(approver.memberId) === employeeIdStr
    );
  };

  // 승인권자 수정 저장
  const handleSaveApprovers = async () => {
    try {
      setLoading(true);
      
      // 승인 ID 재검증
      if (!approvalId) {
        throw new Error('유효한 승인 요청 ID가 없습니다.');
      }
      
      // 선택된 승인권자가 없으면 경고
      if (selectedApprovers.length === 0) {
        alert('최소한 한 명 이상의 승인권자를 선택해주세요.');
        setLoading(false);
        return;
      }
      
      // API 호출을 위한 승인권자 ID 목록 (중복 제거)
      // userId 필드를 사용하도록 수정
      const approverIds = [...new Set(selectedApprovers.map(approver => approver.memberId))];
      
      console.log('API 요청에 포함될 승인권자 IDs:', approverIds);
      
      // 빈 배열 재확인 (추가 안전장치)
      if (approverIds.length === 0) {
        alert('승인권자 목록이 비어있습니다. 최소한 한 명 이상의 승인권자를 선택해주세요.');
        setLoading(false);
        return;
      }
      
      // 요청 정보 로깅
      console.log(`승인권자 수정 요청 URL: ${API_ENDPOINTS.APPROVAL.UPDATE_APPROVERS(approvalId)}`);
      
      // 토큰에 Bearer 접두사 추가
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }
      
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      
      // 백엔드 요구 형식에 맞게 요청 본문 생성
      const requestBody = {
        approverIds: approverIds
      };
      
      console.log('요청 본문:', JSON.stringify(requestBody));
      
      const headers = {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'accept': '*/*'
      };
      
      // API 엔드포인트
      const apiEndpoint = API_ENDPOINTS.APPROVAL.UPDATE_APPROVERS(approvalId);
      
      // 백엔드 API 호출
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      console.log('응답 상태:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log(`서버 응답 전문:`, responseText);
      
      // 403 오류 특별 처리
      if (response.status === 403) {
        console.error('403 오류 발생! 가능한 원인:');
        console.error('1. 승인권자 수정 권한이 없음');
        console.error('2. 토큰이 만료되었거나 유효하지 않음');
        console.error('3. 백엔드의 권한 검증 로직 불일치');
        
        throw new Error('승인권자 수정 권한이 없습니다. 관리자에게 문의하세요. (오류 코드: 403)');
      }
      
      // 성공 처리
      if (response.ok) {
        try {
          // 응답이 있는 경우 파싱 시도
          if (responseText.trim()) {
            const result = JSON.parse(responseText);
            if (result.statusCode && result.statusCode !== 200) {
              throw new Error(result.statusMessage || `승인권자 수정에 실패했습니다. (${result.statusCode})`);
            }
          }
          
          // 성공 처리
          setIsEditApproversModalOpen(false);
          fetchDecisions(); // 승인권자 목록 다시 조회
          alert('승인권자가 성공적으로 수정되었습니다.');
        } catch (parseError) {
          console.error('응답 파싱 오류:', parseError);
          // 파싱 실패 시에도 응답이 OK이면 성공으로 처리
          setIsEditApproversModalOpen(false);
          fetchDecisions();
          alert('승인권자가 성공적으로 수정되었습니다.');
        }
      } else {
        throw new Error(`승인권자 수정에 실패했습니다 (${response.status}): ${responseText || '응답 없음'}`);
      }
    } catch (error) {
      console.error('Error updating approvers:', error);
      alert(`승인권자 수정 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 회사 목록 조회
  useEffect(() => {
    if (isEditApproversModalOpen) {
      console.log('모달 열림 - 회사 목록 조회 시작');
      // 승인권자 데이터 재확인 및 표시
      if (selectedApprovers && selectedApprovers.length > 0) {
        console.log('모달 열림 시 승인권자 상태:', selectedApprovers);
      }
      
      fetchCompanies();
    } else {
      // 모달 닫힐 때 상태 초기화
      setCompanies([]);
      setCompanyEmployees({});
      setExpandedCompanies(new Set());
      // 선택된 승인권자는 초기화하지 않음 (이미 설정된 상태 유지)
    }
  }, [isEditApproversModalOpen]);
  
  // 선택된 승인권자 변경 감지
  useEffect(() => {
    if (selectedApprovers && selectedApprovers.length > 0) {
      console.log('선택된 승인권자 목록 업데이트됨:', 
        selectedApprovers.map(a => ({ 
          id: a.memberId, 
          name: a.memberName,
          approverId: a.approverId 
        }))
      );
    }
  }, [selectedApprovers]);

  // 승인요청 전송 함수
  const handleSendApproval = async () => {
    try {
      // 전송 전 확인
      if (!window.confirm('승인요청을 고객사에 전송하시겠습니까?')) {
        return;
      }
      
      setLoading(true);
      console.log(`승인요청 전송 시작: 승인 ID ${approvalId}`);
      
      // 토큰 가져오기
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }
      
      const authToken = storedToken?.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
      
      // 승인요청 전송 API 호출
      const response = await fetch(API_ENDPOINTS.APPROVAL.SEND(approvalId), {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });
      
      console.log('승인요청 전송 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('승인요청 전송 실패:', errorText);
        throw new Error(`승인요청 전송 실패: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('승인요청 전송 응답:', responseData);
      
      // 성공 메시지 표시
      alert(responseData.message || '승인요청이 성공적으로 전송되었습니다.');
      
      // 승인권자 목록 새로고침
      await fetchDecisions();
    } catch (error) {
      console.error('승인요청 전송 오류:', error);
      alert(`승인요청 전송 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ResponseSection>
        <ApproversSectionHeader>
          <ApproversSectionTitle>승인권자 목록</ApproversSectionTitle>
          <ApproversHeaderButtons>
            <EditApproversButton onClick={openEditApproversModal}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              승인권자 수정
            </EditApproversButton>
            <SendApprovalButton onClick={handleSendApproval} disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2z"></path>
              </svg>
              {loading ? '전송 중...' : '승인요청 전송'}
            </SendApprovalButton>
          </ApproversHeaderButtons>
        </ApproversSectionHeader>
        
        <ResponseList>
          {approversData.length === 0 ? (
            <EmptyResponseMessage>등록된 승인권자가 없습니다.</EmptyResponseMessage>
          ) : (
            sortApprovers(approversData).map((approver) => (
              <ResponseItem 
                key={approver.approverId}
                $hasApproved={hasApprovedDecision(approver)}
                $hasRejected={hasRejectedDecision(approver)}
                $isCompleted={hasApprovedDecision(approver)}
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
                        {expandedApprovers.has(approver.approverId) ? '응답내역 접기' : '지난 응답내역 다시보기'}
                      </CompletedMessage>
                      {expandedApprovers.has(approver.approverId) && (
                        <>
                          {approver.decisionResponses.map((decision) => (
                            <div key={decision.id} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
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
                                <DeleteButton onClick={() => handleDeleteDecision(decision.id, decision.status, decision.approverId, approver.approverName)}>
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
                            <div key={decision.id} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
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
                                <DeleteButton onClick={() => handleDeleteDecision(decision.id, decision.status, decision.approverId, approver.approverName)}>
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
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
              <CloseButton onClick={() => setIsEditApproversModalOpen(false)} disabled={loading}>×</CloseButton>
            </ModalHeader>
            
            <ModalContent>
              {loading && <LoadingIndicator>데이터를 불러오는 중...</LoadingIndicator>}
              
              <CompanyList>
                {loading ? (
                  <LoadingIndicator>회사 목록을 불러오는 중...</LoadingIndicator>
                ) : (
                  companies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      등록된 회사가 없습니다.
                    </div>
                  ) : (
                    companies.map(company => (
                      <CompanyItem key={company.id}>
                        <CompanyHeader onClick={() => !loading && toggleCompany(company)}>
                          <CompanyName>{company.name}</CompanyName>
                          <span>{expandedCompanies.has(company.id) ? '▼' : '▶'}</span>
                        </CompanyHeader>
                        
                        {expandedCompanies.has(company.id) && (
                          <EmployeeList>
                            {!companyEmployees[company.id] ? (
                              <LoadingIndicator>직원 목록을 불러오는 중...</LoadingIndicator>
                            ) : companyEmployees[company.id].length === 0 ? (
                              <div style={{ padding: '10px', color: '#64748b' }}>등록된 직원이 없습니다.</div>
                            ) : (
                              companyEmployees[company.id].map(employee => {
                                // 각 직원이 이미 선택되었는지 확인 (문자열/숫자 타입 불일치 문제 해결)
                                const employeeId = employee.id;
                                const employeeIdStr = String(employeeId);
                                
                                // 새로 추가한 isApproverSelected 함수 사용
                                const isSelected = isApproverSelected(employeeId);
                                
                                // 선택된 승인권자 디버깅
                                if (isSelected) {
                                  console.log(`✓ 체크된 승인권자: ${employee.name} (ID: ${employeeId})`);
                                }
                                
                                return (
                                  <EmployeeItem key={employee.id}>
                                    <EmployeeCheckbox 
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => !loading && handleSelectApprover(employee, e.target.checked)}
                                      disabled={loading}
                                    />
                                    <EmployeeName>{employee.name}</EmployeeName>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                      {employee.email || '이메일 정보 없음'}
                                      {employee.department && ` / ${employee.department}`}
                                      {employee.position && ` / ${employee.position}`}
                                    </span>
                                  </EmployeeItem>
                                );
                              })
                            )}
                          </EmployeeList>
                        )}
                      </CompanyItem>
                    ))
                  )
                )}
              </CompanyList>
              
              <SelectedApprovers>
                <div style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>선택된 승인권자 ({selectedApprovers.length}명)</span>
                  {selectedApprovers.length > 0 && (
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        color: '#dc2626', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1
                      }}
                      onClick={() => !loading && handleRemoveAllApprovers()}
                    >
                      전체 삭제
                    </span>
                  )}
                </div>
                <SelectedApproverList>
                  {selectedApprovers.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '14px', padding: '10px 0' }}>
                      선택된 승인권자가 없습니다. 최소 한 명 이상의 승인권자를 선택해주세요.
                    </div>
                  ) : (
                    selectedApprovers.map(approver => (
                      <SelectedApproverItem key={approver.id}>
                        {approver.memberName}
                        <RemoveApproverButton 
                          onClick={() => !loading && handleRemoveApprover(approver.memberId, approver.memberName)}
                          disabled={loading}
                        >
                          ×
                        </RemoveApproverButton>
                      </SelectedApproverItem>
                    ))
                  )}
                </SelectedApproverList>
              </SelectedApprovers>
            </ModalContent>
            
            <ModalButtonContainer>
              <CancelButton 
                onClick={() => setIsEditApproversModalOpen(false)}
                disabled={loading}
              >
                취소
              </CancelButton>
              <SaveButton 
                onClick={handleSaveApprovers}
                disabled={loading || selectedApprovers.length === 0}
              >
                {loading ? '저장 중...' : '저장'}
              </SaveButton>
            </ModalButtonContainer>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default ApprovalDecision; 