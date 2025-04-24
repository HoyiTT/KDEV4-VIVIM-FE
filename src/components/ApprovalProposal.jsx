import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { ApprovalDecisionStatus } from '../constants/enums';
import ApprovalDecision from './ApprovalDecision';

// Styled Components
const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #64748b;
`;

const ProposalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  padding-bottom: 16px;
  overflow-y: auto;
  max-height: calc(100% - 100px);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ProposalItem = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const ProposalContent = styled.div`
  margin-bottom: 8px;
`;

const ProposalDescription = styled.div`
  display: none;
`;

const ListProposalInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const CreatorInfo = styled.div`
  display: flex;
  gap: 8px;
`;

const CompanyName = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const CreatorName = styled.span`
  font-size: 12px;
  color: #1e293b;
  font-weight: 500;
`;

const DateInfo = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const ProposalActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;

  &:hover {
    background: #fecaca;
  }
`;

const SendButton = styled(ActionButton)`
  background: white;
  border: 1px solid #2E7D32;
  color: #2E7D32;
  width: 100%;
  text-align: center;
  padding: 8px 16px;
  transition: all 0.2s;

  &:hover {
    background: #2E7D32;
    color: white;
  }
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: #2E7D32;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
  width: 100%;

  &:hover {
    background: #1B5E20;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  min-width: 100px;
  min-height: 500px;
  width: 100%;
  max-width: 40vw;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const ModalFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ModalButton = styled.button.withConfig({ shouldForwardProp: prop => prop !== 'primary' })`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.primary ? `
    background: #2E7D32;
    color: white;
    border: none;

    &:hover {
      background: #1B5E20;
    }
  ` : `
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const SidePanelOverlay = styled(ModalOverlay)`
  justify-content: flex-end;
`;

const SidePanelContent = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  ${props => props.isFullscreen && `
    max-width: 100%;
  `}
`;

const SidePanelHeader = styled(ModalHeader)`
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const SidePanelBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SidePanelFooter = styled(ModalFooter)`
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
`;

const SidePanelActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const SidePanelButton = styled(ModalButton)`
  width: 100%;
`;

const FullscreenButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  margin-right: 8px;

  &:hover {
    color: #1e293b;
  }
`;

const ProposalTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
`;

const ProposalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
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
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
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

const ResponseSection = styled.div`
  margin-top: 24px;
`;

const ResponseTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 16px;
`;

const ResponseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResponseItem = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 16px;
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ResponseName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ResponseDate = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const ResponseContent = styled.div`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
`;

const ResponseStatus = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case ApprovalDecisionStatus.APPROVED:
        return '#dcfce7';
      case ApprovalDecisionStatus.REJECTED:
        return '#fee2e2';
      default:
        return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case ApprovalDecisionStatus.APPROVED:
        return '#16a34a';
      case ApprovalDecisionStatus.REJECTED:
        return '#dc2626';
      default:
        return '#64748b';
    }
  }};
`;

const EmptyResponseMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
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
  background: white;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #94a3b8;
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
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
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #94a3b8;
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
  }

  option {
    padding: 8px;
  }
`;

const getStatusColor = (status) => {
  switch (status) {
    case 'BEFORE_REQUEST_PROPOSAL':
      return {
        background: '#f1f5f9',
        text: '#64748b',
        border: '1px solid #e2e8f0'
      };
    case 'REQUEST_PROPOSAL':
      return {
        background: '#dbeafe',
        text: '#2563eb',
        border: '1px solid #bfdbfe'
      };
    case 'APPROVED':
      return {
        background: '#dcfce7',
        text: '#16a34a',
        border: '1px solid #bbf7d0'
      };
    case 'REJECTED':
      return {
        background: '#fee2e2',
        text: '#dc2626',
        border: '1px solid #fecaca'
      };
    default:
      return {
        background: '#f1f5f9',
        text: '#64748b',
        border: '1px solid #e2e8f0'
      };
  }
};

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.background};
  color: ${props => props.text};
  border: ${props => props.border};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const ListProposalTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProposalHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

const AddButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  padding-top: 8px;
  margin-top: auto;
  z-index: 2;
`;

// 승인권자 지정을 위한 스타일 컴포넌트
const ApproverSection = styled.div`
  margin-top: 16px;
  padding: 16px;
`;
const CompanyToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  &:focus { outline: none; }
`;
const EmployeeList = styled.div`
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const EmployeeItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
`;

const ApprovalProposal = ({ progressId, showMore, onShowMore }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [approvalDecisions, setApprovalDecisions] = useState([]);
  const [newDecision, setNewDecision] = useState({ content: '', status: '' });
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: '', content: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const contentRef = useRef(null);
  const [companies, setCompanies] = useState([]);
  const [companyEmployees, setCompanyEmployees] = useState({});
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [selectedApprovers, setSelectedApprovers] = useState([]);

  // 회사 및 승인권자 조회 함수들을 state 선언 이후에 위치시킵니다.
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.COMPANIES, {
        headers: {
          'Authorization': token,
          'accept': '*/*'
        }
      });
      if (!res.ok) throw new Error('회사 목록 조회 실패');
      const json = await res.json();
      // 응답의 data 필드를 우선 사용
      const list = json.data ?? json.companies ?? json.items ?? (Array.isArray(json) ? json : []);
      const customerCompanies = list.filter(c => c.companyRole?.toUpperCase() === 'CUSTOMER');
      setCompanies(customerCompanies);
    } catch (err) {
      console.error(err);
      alert('회사 목록을 불러오는데 실패했습니다.');
    }
  };

  const toggleCompany = async (company) => {
    // 이미 펼쳐진 회사는 닫기
    if (expandedCompanies.has(company.id)) {
      setExpandedCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(company.id);
        return newSet;
      });
      return;
    }
    // 직원 목록이 캐시에 없으면 API 호출하여 가져오기
    if (!companyEmployees[company.id]) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ENDPOINTS.COMPANY_EMPLOYEES(company.id), {
          headers: { 'Authorization': token, 'accept': '*/*' }
        });
        if (res.ok) {
          const json = await res.json();
          const empList = json.data ?? json.employees ?? json.items ?? (Array.isArray(json) ? json : []);
          setCompanyEmployees(prev => ({ ...prev, [company.id]: empList }));
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    }
    // 토글 확장
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      newSet.add(company.id);
      return newSet;
    });
  };

  const handleSelectApprover = (employee, checked) => {
    setSelectedApprovers(prev =>
      checked ? [...prev, { userId: employee.id, name: employee.name }] : prev.filter(a => a.userId !== employee.id)
    );
  };

  useEffect(() => {
    fetchProposals();
  }, [progressId]);

  useEffect(() => {
    if (isProposalModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isProposalModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      fetchCompanies();
    } else {
      setCompanies([]);
      setCompanyEmployees({});
      setExpandedCompanies(new Set());
      setSelectedApprovers([]);
    }
  }, [isModalOpen]);

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.LIST(progressId), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      setProposals(data.approvalList || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      alert(error.message || '승인요청 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleProposalClick = async (proposal) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.DETAIL(proposal.id), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('승인요청 상세 조회에 실패했습니다.');
      }

      const data = await response.json();
      setSelectedProposal(data);
      setIsProposalModalOpen(true);
    } catch (error) {
      console.error('Error fetching proposal detail:', error);
      alert('승인요청 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleAddProposal = async () => {
    if (!newProposal.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!newProposal.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const requestBody = { ...newProposal, approverIds: selectedApprovers.map(a => a.userId) };
      const response = await fetch(API_ENDPOINTS.APPROVAL.CREATE(progressId), {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      const createdId = result.data || result.id;
      if (createdId) {
        // 생성된 승인요청에 승인권자 할당
        await fetch(API_ENDPOINTS.APPROVAL.CREATE_APPROVER(createdId), {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ approverIds: selectedApprovers.map(a => a.userId) })
        });
      }
      // 리스트 새로 고침
      window.location.reload();
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('승인요청 생성에 실패했습니다.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProposal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModifyProposal = async () => {
    try {
      const token = localStorage.getItem('token');
      const requestBody = {};
      
      if (editingProposal.title !== undefined) {
        requestBody.title = editingProposal.title;
      }
      if (editingProposal.content !== undefined) {
        requestBody.content = editingProposal.content;
      }

      const response = await fetch(API_ENDPOINTS.APPROVAL.MODIFY(editingProposal.id), {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.statusCode === 201) {
        setIsEditModalOpen(false);
        setEditingProposal(null);
        fetchProposals();
      } else {
        throw new Error(result.statusMessage || '승인요청 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error modifying proposal:', error);
      alert(error.message);
    }
  };

  const handleEditClick = (proposal) => {
    setEditingProposal({ ...proposal });
    setIsEditModalOpen(true);
  };

  const handleDeleteProposal = async (approvalId) => {
    if (!window.confirm('정말로 이 승인요청을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.DELETE(approvalId), {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('승인요청 삭제에 실패했습니다.');
      }

      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('승인요청 삭제에 실패했습니다.');
    }
  };

  const handleSendProposal = async (approvalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.RESEND(approvalId), {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('승인요청 전송에 실패했습니다.');
      }

      fetchProposals();
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('승인요청 전송에 실패했습니다.');
    }
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
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleShowMore = () => {
    setShowAll(!showAll);
    if (onShowMore) {
      const fullHeight = contentRef.current?.scrollHeight || 0;
      onShowMore(fullHeight);
    }
  };

  if (loading) {
    return <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>;
  }

  return (
    <>
      <ProposalContainer>
        <ProposalList ref={contentRef}>
          {proposals.length === 0 ? (
            <EmptyState>등록된 승인요청이 없습니다.</EmptyState>
          ) : (
            <>
              {proposals.slice(0, showAll ? proposals.length : 2).map((proposal) => {
                const colors = getStatusColor(proposal.approvalProposalStatus);
                return (
                  <ProposalItem key={proposal.id} onClick={() => handleProposalClick(proposal)}>
                    <ProposalContent>
                      <ProposalHeader>
                        <StatusBadge
                          background={colors.background}
                          text={colors.text}
                          border={colors.border}
                        >
                          {getStatusText(proposal.approvalProposalStatus)}
                        </StatusBadge>
                        <ListProposalTitle>{proposal.title}</ListProposalTitle>
                      </ProposalHeader>
                    </ProposalContent>
                    <ListProposalInfo>
                      <CreatorInfo>
                        <CompanyName>{proposal.creator.companyName}</CompanyName>
                        <CreatorName>{proposal.creator.name}</CreatorName>
                      </CreatorInfo>
                      <DateInfo>{formatDate(proposal.createdAt)}</DateInfo>
                    </ListProposalInfo>
                    <ProposalActions>
                      {(proposal.approvalProposalStatus === 'BEFORE_REQUEST_PROPOSAL' || 
                        proposal.approvalProposalStatus === 'REJECTED') && (
                        <SendButton onClick={() => handleSendProposal(proposal.id)}>
                          승인요청 전송
                        </SendButton>
                      )}
                    </ProposalActions>
                  </ProposalItem>
                );
              })}
            </>
          )}
        </ProposalList>
        {showMore && proposals.length > 2 && (
          <ShowMoreButton onClick={handleShowMore}>
            {showAll ? '접기' : '더보기'}
          </ShowMoreButton>
        )}
        <AddButtonContainer>
          <AddButton onClick={() => { fetchCompanies(); setIsModalOpen(true); }}>
            + 승인요청 추가
          </AddButton>
        </AddButtonContainer>
      </ProposalContainer>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>새 승인요청 추가</ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  name="title"
                  value={newProposal.title}
                  onChange={handleInputChange}
                  placeholder="제목을 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>내용</Label>
                <TextArea
                  name="content"
                  value={newProposal.content}
                  onChange={handleInputChange}
                  placeholder="내용을 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>승인권자 목록</Label>
              </InputGroup>
              <ApproverSection>
                {companies.length === 0 ? (
                  <EmptyState>연결된 고객사가 없습니다.</EmptyState>
                ) : (
                  companies.map(company => (
                    <div key={company.id}>
                      <CompanyToggle onClick={() => toggleCompany(company)}>
                        <span>{company.companyName || company.name || `회사 ${company.id}`}</span>
                        <span>{expandedCompanies.has(company.id) ? '▼' : '▶'}</span>
                      </CompanyToggle>
                      {expandedCompanies.has(company.id) && (
                        <EmployeeList>
                          {(companyEmployees[company.id] || []).map(emp => (
                            <EmployeeItem key={emp.id}>
                              <input type="checkbox" checked={selectedApprovers.some(a => a.userId === emp.id)} onChange={e => handleSelectApprover(emp, e.target.checked)} />
                              <span>{emp.name}</span>
                            </EmployeeItem>
                          ))}
                        </EmployeeList>
                      )}
                    </div>
                  ))
                )}
              </ApproverSection>
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={() => setIsModalOpen(false)}>취소</ModalButton>
              <ModalButton primary onClick={handleAddProposal}>추가</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {isProposalModalOpen && selectedProposal && (
        <ModalOverlay onClick={() => setIsProposalModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>승인요청 상세보기</ModalTitle>
              <CloseButton onClick={() => setIsProposalModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <ProposalTitle>{selectedProposal.title}</ProposalTitle>
              <ProposalInfo>
                <InfoItem>
                  <InfoLabel>작성자</InfoLabel>
                  <InfoValue>{selectedProposal.creator.name} ({selectedProposal.creator.companyName})</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>작성일</InfoLabel>
                  <InfoValue>{formatDate(selectedProposal.createdAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>상태</InfoLabel>
                  <InfoValue>
                    <ResponseStatus status={selectedProposal.approvalProposalStatus}>
                      {getStatusText(selectedProposal.approvalProposalStatus)}
                    </ResponseStatus>
                  </InfoValue>
                </InfoItem>
              </ProposalInfo>
              <ContentSection>
                {selectedProposal.content}
              </ContentSection>
              <ProposalSubtitle withMargin>
                <span>승인권자별 응답목록</span>
              </ProposalSubtitle>
              <ApprovalDecision approvalId={selectedProposal.id} />
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={() => setIsProposalModalOpen(false)}>닫기</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default ApprovalProposal; 