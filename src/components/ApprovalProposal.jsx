import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { ApprovalDecisionStatus } from '../constants/enums';
import ApprovalDecision from './ApprovalDecision';

const getStatusColor = (status) => {
  switch (status) {
    case 'BEFORE_REQUEST_PROPOSAL':
      return {
        background: '#f1f5f9',
        text: '#64748b'
      };
    case 'REQUEST_PROPOSAL':
      return {
        background: '#dbeafe',
        text: '#2563eb'
      };
    case 'APPROVED':
      return {
        background: '#dcfce7',
        text: '#16a34a'
      };
    case 'REJECTED':
      return {
        background: '#fee2e2',
        text: '#dc2626'
      };
    default:
      return {
        background: '#f1f5f9',
        text: '#64748b'
      };
  }
};

// Styled Components
const ProposalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const ProposalItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ProposalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ProposalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProposalTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  padding: 24px 20px;
  line-height: 1.3;
`;

const ProposalSubtitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #475569;
  margin: 0;
  padding: 0 20px 20px;
  border-bottom: ${props => props.withMargin ? 'none' : '1px solid #e2e8f0'};
  margin-top: ${props => props.withMargin ? '70px' : '0px'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProposalDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  display: none;
`;

const ProposalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const CreatorInfo = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CompanyName = styled.span`
  font-weight: 500;
  color: #475569;
`;

const CreatorName = styled.span`
  color: #64748b;
`;

const DateInfo = styled.span`
  color: #94a3b8;
`;

const ProposalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    color: #1e293b;
  }
`;

const DeleteButton = styled(ActionButton)`
  border-color: #fee2e2;
  color: #ef4444;

  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`;

const SendButton = styled(ActionButton)`
  border-color: #dbeafe;
  color: #2563eb;

  &:hover {
    background: #dbeafe;
    color: #1d4ed8;
  }
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.background};
  color: ${props => props.text};
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AddButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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
  height: 100px;
  font-size: 14px;
  color: #64748b;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 14px;
  color: #64748b;
`;

const SidePanelOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  backdrop-filter: blur(4px);
`;

const SidePanelContent = styled.div`
  background: white;
  width: ${props => props.isFullscreen ? '100%' : '800px'};
  height: 100vh;
  overflow-y: auto;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const SidePanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const HeaderInfo = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const HeaderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
`;

const HeaderAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
`;

const HeaderDate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
`;

const SidePanelBody = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
`;

const SidePanelFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const SidePanelTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    color: #1e293b;
    transform: scale(1.1);
  }
`;

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
  cursor: pointer;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: default;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #1e293b;
`;

const ModalBody = styled.div`
  padding: 16px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Label = styled.label`
  min-width: 100px;
  font-size: 14px;
  color: #475569;
  text-align: right;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  color: #1e293b;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  height: 120px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  color: #1e293b;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
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
    background: white;
    border: 1px solid #e2e8f0;
    color: #475569;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
  `}
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  margin-top: 30px;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin-bottom: 12px;
`;

const ContentSection = styled.div`
  padding: 32px 20px;
  font-size: 15px;
  color: #1e293b;
  line-height: 1.7;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

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
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ResponseName = styled.div`
  font-size: 14px;
  font-weight: 500;
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
`;

const ResponseActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;

const ResponseButton = styled.button`
  padding: 4px 8px;
  background: white;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const StatusSelect = styled.select`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
`;

const RequiredLabel = styled.span`
  color: #ef4444;
  margin-left: 4px;
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

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  min-width: 80px;
  color: #64748b;
`;

const InfoValue = styled.span`
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseStatus = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const ProposalDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #1e293b;
`;

const SidePanelButton = styled.button`
  padding: 10px 20px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const FullscreenButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  margin-right: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #1e293b;
    transform: scale(1.1);
  }
`;

const ListProposalTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
`;

const ListProposalInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #64748b;
`;

const ApprovalProposal = ({ progressId }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [newProposal, setNewProposal] = useState({
    title: '',
    content: ''
  });
  const [newDecision, setNewDecision] = useState({
    content: '',
    status: ''
  });
  const [editingProposal, setEditingProposal] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [approvalDecisions, setApprovalDecisions] = useState([]);

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

  const fetchApprovers = async (approvalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.APPROVERS(approvalId), {
        method: 'GET',
        headers: {
          'Authorization': token,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      setApprovers(data);
    } catch (error) {
      console.error('Error fetching approvers:', error);
      alert(error.message || '승인권자 목록을 불러오는데 실패했습니다.');
    }
  };

  const fetchApprovalDecisions = async (approvalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DECISION.DETAIL(approvalId), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('승인응답 목록 조회에 실패했습니다.');
      }

      const data = await response.json();
      setApprovalDecisions(data.items[0]?.approvers || []);
    } catch (error) {
      console.error('Error fetching approval decisions:', error);
      alert('승인응답 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    if (selectedProposal) {
      fetchApprovalDecisions(selectedProposal.id);
    }
  }, [selectedProposal]);

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
      await fetchApprovers(proposal.id);
    } catch (error) {
      console.error('Error fetching proposal detail:', error);
      alert('승인요청 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleAddProposal = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.CREATE(progressId), {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProposal)
      });

      const result = await response.json();
      
      if (result.statusCode === 0) {
        window.location.reload();
      }
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

  const displayedProposals = showAll ? proposals : proposals.slice(0, 3);

  const handleCreateDecision = async () => {
    if (!newDecision.content || newDecision.content.trim() === '') {
      alert('응답 내용을 입력해주세요.');
      return;
    }

    if (!newDecision.status) {
      alert('승인 상태를 선택해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DECISION.CREATE(selectedProposal.id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          content: newDecision.content,
          decisionStatus: newDecision.status,
          approverId: selectedApprover.approverId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      setIsDecisionModalOpen(false);
      setNewDecision({ content: '', status: '' });
      fetchApprovers(selectedProposal.id);
    } catch (error) {
      console.error('Error creating decision:', error);
      alert(error.message || '승인응답 생성에 실패했습니다.');
    }
  };

  if (loading) {
    return <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>;
  }

  return (
    <>
      <ProposalContainer>
        <ProposalList>
          {proposals.length === 0 ? (
            <EmptyState>등록된 승인요청이 없습니다.</EmptyState>
          ) : (
            <>
              {displayedProposals.map((proposal) => {
                const colors = getStatusColor(proposal.approvalProposalStatus);
                return (
                  <ProposalItem key={proposal.id} onClick={() => handleProposalClick(proposal)}>
                    <ProposalContent>
                      <ProposalHeader>
                        <StatusBadge
                          background={colors.background}
                          text={colors.text}
                        >
                          {getStatusText(proposal.approvalProposalStatus)}
                        </StatusBadge>
                        <ListProposalTitle>{proposal.title}</ListProposalTitle>
                      </ProposalHeader>
                      <ProposalDescription>{proposal.content}</ProposalDescription>
                    </ProposalContent>
                    <ListProposalInfo>
                      <CreatorInfo>
                        <CompanyName>{proposal.creator.companyName}</CompanyName>
                        <CreatorName>{proposal.creator.name}</CreatorName>
                      </CreatorInfo>
                      <DateInfo>{formatDate(proposal.createdAt)}</DateInfo>
                    </ListProposalInfo>
                    <ProposalActions>
                      <ActionButton onClick={() => handleEditClick(proposal)}>
                        수정
                      </ActionButton>
                      <DeleteButton onClick={() => handleDeleteProposal(proposal.id)}>
                        삭제
                      </DeleteButton>
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
              {proposals.length > 3 && !showAll && (
                <ShowMoreButton onClick={() => setShowAll(true)}>
                  더보기
                </ShowMoreButton>
              )}
            </>
          )}
        </ProposalList>
        <AddButton onClick={() => setIsModalOpen(true)}>
          + 승인요청 추가
        </AddButton>
      </ProposalContainer>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>새 승인요청</ModalTitle>
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
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={() => setIsModalOpen(false)}>취소</ModalButton>
              <ModalButton primary onClick={handleAddProposal}>추가</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {isEditModalOpen && editingProposal && (
        <ModalOverlay onClick={() => setIsEditModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>승인요청 수정</ModalTitle>
              <CloseButton onClick={() => setIsEditModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={editingProposal.title || ''}
                  onChange={(e) => setEditingProposal(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  placeholder="제목을 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>내용</Label>
                <TextArea
                  value={editingProposal.content || ''}
                  onChange={(e) => setEditingProposal(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  placeholder="내용을 입력하세요"
                />
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={() => setIsEditModalOpen(false)}>취소</ModalButton>
              <ModalButton primary onClick={handleModifyProposal}>수정</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {isProposalModalOpen && selectedProposal && (
        <SidePanelOverlay onClick={() => setIsProposalModalOpen(false)}>
          <SidePanelContent onClick={(e) => e.stopPropagation()} isFullscreen={isFullscreen}>
            <SidePanelHeader>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FullscreenButton onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? '⤢' : '⤡'}
                </FullscreenButton>
                <CloseButton onClick={() => setIsProposalModalOpen(false)}>×</CloseButton>
              </div>
            </SidePanelHeader>
            <SidePanelBody>
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
                    <StatusBadge status={selectedProposal.approvalProposalStatus}>
                      {getStatusText(selectedProposal.approvalProposalStatus)}
                    </StatusBadge>
                  </InfoValue>
                </InfoItem>
              </ProposalInfo>
              <ContentSection>
                {selectedProposal.content}
              </ContentSection>
              <ProposalSubtitle withMargin>
                <span>승인권자별 응답목록</span>
              </ProposalSubtitle>
              {approvalDecisions.map((approver) => (
                <ResponseSection key={approver.approverId}>
                  <ResponseTitle>
                    <span>{approver.approverName}</span>
                  </ResponseTitle>
                  <ResponseList>
                    {approver.decisionList.length > 0 ? (
                      approver.decisionList.map((decision) => (
                        <ResponseItem key={decision.id}>
                          <ResponseHeader>
                            <ResponseName>{decision.title}</ResponseName>
                            <ResponseDate>{formatDate(decision.decidedAt)}</ResponseDate>
                          </ResponseHeader>
                          <ResponseContent>
                            <ResponseStatus status={decision.status}>
                              {decision.status === 'APPROVED' ? '승인' : '거절'}
                            </ResponseStatus>
                          </ResponseContent>
                        </ResponseItem>
                      ))
                    ) : (
                      <EmptyResponseMessage>아직 응답이 없습니다.</EmptyResponseMessage>
                    )}
                  </ResponseList>
                </ResponseSection>
              ))}
            </SidePanelBody>
            <SidePanelFooter>
              <SidePanelButton onClick={() => setIsProposalModalOpen(false)}>닫기</SidePanelButton>
            </SidePanelFooter>
          </SidePanelContent>
        </SidePanelOverlay>
      )}

      {isDecisionModalOpen && selectedApprover && (
        <ModalOverlay onClick={() => setIsDecisionModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedApprover.approverName}님의 승인응답 작성</ModalTitle>
              <CloseButton onClick={() => setIsDecisionModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={() => setIsDecisionModalOpen(false)}>취소</ModalButton>
              <ModalButton primary onClick={handleCreateDecision}>저장</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default ApprovalProposal; 