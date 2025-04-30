import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { ApprovalDecisionStatus, ApprovalProposalStatus } from '../constants/enums';
import ApprovalDecision from './ApprovalDecision';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaClock, FaPlus, FaArrowLeft, FaArrowRight, FaEdit, FaTrashAlt, FaEllipsisV, FaEye } from 'react-icons/fa';
import approvalUtils from '../utils/approvalStatus';

const { getApprovalStatusText, getApprovalStatusBackgroundColor, getApprovalStatusTextColor } = approvalUtils;

// Styled Components
const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #64748b;
`;

const ProposalContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
`;

const ProposalList = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
  box-sizing: border-box;
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
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const ProposalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
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

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  margin-left: 8px;

  &:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
`;

const SendButton = styled(ActionButton)`
  background: #2E7D32;
  border: none;
  color: white;
  width: 100%;
  text-align: center;
  padding: 8px 16px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #1B5E20;
    color: white;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(46, 125, 50, 0.1);
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
  background: ${props => props.disabled ? '#e2e8f0' : 'linear-gradient(to right, #3b82f6, #2563eb)'};
  border: none;
  border-radius: 6px;
  color: ${props => props.disabled ? '#94a3b8' : 'white'};
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  align-self: flex-start;
  width: 100%;

  &:hover {
    background: ${props => props.disabled ? '#e2e8f0' : 'linear-gradient(to right, #2563eb, #1d4ed8)'};
  }

  &:active {
    transform: translateY(1px);
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
  padding: 0;
  box-sizing: border-box;
  
  @media (max-width: 1400px) {
    padding: 0 10%;
  }
  
  @media (max-width: 768px) {
    padding: 0 5%;
  }
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
  padding: 16px 24px;
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
  padding: 0;
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
  padding: 16px 24px;
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
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  gap: 5px;
  background-color: ${props => getApprovalStatusBackgroundColor(props.status)};
  color: ${props => getApprovalStatusTextColor(props.status)};
  
  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${props => getApprovalStatusTextColor(props.status)};
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
  return {
    background: getApprovalStatusBackgroundColor(status),
    text: getApprovalStatusTextColor(status)
  };
};

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background-color: ${props => {
    switch (props.background) {
      case '#dcfce7':
        return 'rgba(4, 120, 87, 0.08)';
      case '#fee2e2':
        return 'rgba(185, 28, 28, 0.08)';
      case '#f1f5f9':
        return 'rgba(75, 85, 99, 0.08)';
      case '#dbeafe':
        return 'rgba(30, 64, 175, 0.08)';
      default:
        return 'rgba(75, 85, 99, 0.08)';
    }
  }};
  color: ${props => props.text};
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${props => props.text};
    opacity: 0.9;
  }
`;

const ListProposalTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProposalHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  box-sizing: border-box;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  margin-left: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SendButtonSmall = styled.button`
  padding: 4px 8px;
  background: white;
  color: #2E7D32;
  border: 1px solid #2E7D32;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f9f0;
    color: #1B5E20;
    border-color: #1B5E20;
  }
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

const ActionIcons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: #2563eb;
    background-color: #f0f7ff;
  }
  
  &.delete:hover {
    color: #dc2626;
    background-color: #fee2e2;
  }
`;

// 파일 관련 스타일 컴포넌트 추가
const FileInputContainer = styled.div`
  margin-bottom: 16px;

  &::after {
    content: '* 파일 크기는 10MB 이하여야 합니다.';
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileButton = styled.button`
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8fafc;
  }
`;

const FileList = styled.ul`
  list-style: none;
  padding: 8px 16px;
  margin: 8px 0 0 0;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;
    margin-bottom: 8px;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

const FileContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: #f1f5f9;
  }
`;

const LinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  color: #2563eb;
  text-decoration: underline;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: #1d4ed8;
    background-color: #f1f5f9;
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
`;

const ApprovalProposal = ({ 
  progressId, 
  projectId,
  showMore, 
  onShowMore,
  progressStatus = {
    progressList: []
  }
}) => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
  const [isCustomer, setIsCustomer] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [links, setLinks] = useState([]);
  
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    'application/pdf', 'application/rtf', 'text/plain', 'text/rtf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
    'application/json', 'application/xml', 'text/html', 'text/css', 'application/javascript'
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileDelete = (indexToDelete) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToDelete));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log('선택된 파일들:', selectedFiles);
    
    // 파일 크기 검증
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert('10MB 이상의 파일은 업로드할 수 없습니다:\n' + 
        oversizedFiles.map(file => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`).join('\n'));
      e.target.value = ''; // 파일 선택 초기화
      return;
    }

    // 기존 파일 목록에 새로 선택된 파일들 추가
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    e.target.value = ''; // 파일 선택 초기화
  };

  // 프로젝트 참여 유저 목록 가져오기
  const fetchProjectUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.PROJECTS}/${projectId}/users`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setProjectUsers(data);
    } catch (error) {
      console.error('Error fetching project users:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectUsers();
    }
  }, [projectId]);

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
          
          // 프로젝트에 참여하는 직원만 필터링
          const projectParticipatingEmployees = empList.filter(emp => 
            projectUsers.some(pu => pu.userId === emp.id)
          );
          
          setCompanyEmployees(prev => ({ ...prev, [company.id]: projectParticipatingEmployees }));
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
      checked 
        ? [...prev, { 
            userId: employee.id, 
            memberId: employee.id,
            name: employee.name 
          }] 
        : prev.filter(a => a.userId !== employee.id)
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
      console.log('Received approval data:', data);
      setProposals(data.approvalList || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      alert(error.message || '승인요청 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleProposalClick = (proposal) => {
    navigate(`/approval/${proposal.id}`);
  };

  const handleAddProposal = async () => {
    if (!newProposal.title.trim() || !newProposal.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 1. 승인요청 생성
      const response = await fetch(API_ENDPOINTS.APPROVAL.CREATE(progressId), {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newProposal.title,
          content: newProposal.content
        })
      });

      if (!response.ok) {
        throw new Error('승인요청 생성에 실패했습니다.');
      }

      const data = await response.json();
      const approvalId = data.data;
      console.log('생성된 data', data);

      // 2. 파일 업로드 처리
      console.log('파일 업로드 시작, 파일 수:', files.length);
      for (const file of files) {
        console.log('파일 업로드 시도:', file.name);
        
        // 2-1. Presigned URL 요청
        const presignedResponse = await fetch(API_ENDPOINTS.APPROVAL.FILE_PRESIGNED(approvalId), {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type
          })
        });

        if (!presignedResponse.ok) {
          console.error('Presigned URL 요청 실패:', await presignedResponse.text());
          throw new Error(`Presigned URL 요청 실패: ${file.name}`);
        }

        const { preSignedUrl } = await presignedResponse.json();
        console.log('Presigned URL 획득 성공:', file.name);

        // 2-2. 파일 업로드
        const uploadResponse = await fetch(preSignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        if (!uploadResponse.ok) {
          console.error('파일 업로드 실패:', await uploadResponse.text());
          throw new Error(`파일 업로드 실패: ${file.name}`);
        }
        console.log('파일 업로드 성공:', file.name);
      }

      // 3. 링크 저장 처리
      console.log('링크 저장 시작, approvalId:', data);
      console.log('저장할 링크 목록:', links);
      for (const link of links) {
        console.log('링크 저장 시도:', link);
        const linkResponse = await fetch(API_ENDPOINTS.APPROVAL.LINKS(approvalId), {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: link.title,
            url: link.url
          })
        });

        if (!linkResponse.ok) {
          console.error('링크 저장 실패 응답:', await linkResponse.text());
          throw new Error(`링크 저장 실패: ${link.title}`);
        }
        console.log('링크 저장 성공:', link.title);
      }

      // 4. 승인권자 설정
      if (selectedApprovers.length > 0) {
        const approversResponse = await fetch(API_ENDPOINTS.APPROVAL.CREATE_APPROVER(approvalId), {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approverIds: selectedApprovers.map(approver => approver.userId)
          })
        });

        if (!approversResponse.ok) {
          throw new Error('승인권자 설정에 실패했습니다.');
        }
      }

      alert('승인요청이 성공적으로 생성되었습니다.');
      setNewProposal({ title: '', content: '' });
      setFiles([]);
      setLinks([]);
      setNewLink({ title: '', url: '' });
      setSelectedApprovers([]);
      setIsModalOpen(false);
      onShowMore();
      fetchProposals();
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert(`승인요청 생성에 실패했습니다: ${error.message}`);
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
      
      // 전송 전 승인권자 수 확인
      console.log('승인요청 전송 전 승인권자 확인 중...', approvalId);
      
      try {
        const checkApproversResponse = await fetch(API_ENDPOINTS.APPROVAL.APPROVERS(approvalId), {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'accept': '*/*'
          }
        });
  
        console.log('승인권자 확인 API 응답 상태:', checkApproversResponse.status);
        
        // 응답 텍스트 먼저 확인
        const responseText = await checkApproversResponse.text();
        console.log('승인권자 확인 API 응답 텍스트:', responseText);
  
        // 응답이 있으면 JSON으로 파싱
        let approversList = [];
        if (responseText) {
          try {
            const approversData = JSON.parse(responseText);
            console.log('파싱된 승인권자 데이터:', approversData);
            
            // 다양한 응답 형식 처리
            if (approversData.approverResponses) {
              approversList = approversData.approverResponses;
            } else if (Array.isArray(approversData)) {
              approversList = approversData;
            } else if (approversData.data && Array.isArray(approversData.data)) {
              approversList = approversData.data;
            } else if (approversData.approvers && Array.isArray(approversData.approvers)) {
              approversList = approversData.approvers;
            }
            
            console.log('승인권자 수:', approversList.length);
          } catch (jsonError) {
            console.error('승인권자 데이터 파싱 오류:', jsonError);
          }
        }
        
        // 승인권자가 한 명도 없으면 전송 중단
        if (approversList.length === 0) {
          window.alert('승인권자가 한 명 이상 등록되어야 승인요청을 전송할 수 있습니다.');
          return;
        }
      } catch (approversError) {
        console.error('승인권자 확인 중 오류:', approversError);
        window.alert('승인권자 확인 중 오류가 발생했습니다. 승인권자가 한 명 이상 등록되어야 합니다.');
        return;
      }
      
      // 승인권자가 있으면 전송 진행
      console.log('승인요청 전송 API 호출 시작');
      const response = await fetch(API_ENDPOINTS.APPROVAL.SEND(approvalId), {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('승인요청 전송 실패 응답:', errorText);
        
        // 특정 에러 메시지 처리
        if (errorText.includes('AP006') || errorText.includes('지정된 승인권자가 있어야 승인요청을 보낼 수 있습니다')) {
          window.alert('승인권자가 한 명 이상 등록되어야 승인요청을 전송할 수 있습니다.');
          return;
        }
        
        // 400 에러인 경우 특별 처리
        if (response.status === 400) {
          if (errorText.includes('이미 전송된 승인요청')) {
            window.alert('이미 전송된 승인요청입니다. 내용 변경 후 다시 시도해주세요.');
          } else {
            window.alert('승인요청 전송에 실패했습니다. 필수 정보가 모두 입력되었는지 확인해주세요.');
          }
          return;
        }
        
        throw new Error(`승인요청 전송에 실패했습니다: ${response.status}`);
      }

      window.alert('승인요청이 성공적으로 전송되었습니다.');
      fetchProposals();
    } catch (error) {
      console.error('Error sending proposal:', error);
      window.alert(error.message || '승인요청 전송에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleShowMore = () => {
    // 더 이상 필요 없음
  };

  // 현재 단계의 상태 확인
  const isStageCompleted = progressStatus?.progressList?.find(
    status => status.progressId === progressId
  )?.isCompleted || false;

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const isCustomerUser = decodedToken.role === 'CUSTOMER';
        setIsCustomer(isCustomerUser);
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsCustomer(false);
      }
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.PROJECT_COMPANIES(projectId), {
        headers: {
          'Authorization': token,
          'accept': '*/*'
        }
      });
      if (!res.ok) throw new Error('회사 목록 조회 실패');
      const json = await res.json();
      const customerCompanies = json.filter(company => company.companyRole === 'CUSTOMER');
      setCompanies(customerCompanies);
    } catch (err) {
      console.error(err);
      alert('회사 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      alert('링크 제목과 URL을 모두 입력해주세요.');
      return;
    }

    // URL 형식 검증
    try {
      new URL(newLink.url);
    } catch (e) {
      alert('올바른 URL 형식이 아닙니다.');
      return;
    }

    // 새 링크 추가
    setLinks(prevLinks => [...prevLinks, { ...newLink }]);
    
    // 입력 필드 초기화
    setNewLink({ title: '', url: '' });
  };

  const handleLinkDelete = (indexToDelete) => {
    setLinks(prevLinks => prevLinks.filter((_, index) => index !== indexToDelete));
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
              {proposals.map((proposal) => {
                const colors = getStatusColor(proposal.approvalProposalStatus);
                return (
                  <ProposalItem key={proposal.id} onClick={() => handleProposalClick(proposal)}>
                    <ProposalContent>
                      <ProposalHeader>
                        <HeaderLeft>
                          <StatusBadge
                            background={colors.background}
                            text={colors.text}
                          >
                            {getApprovalStatusText(proposal.approvalProposalStatus)}
                          </StatusBadge>
                          <ListProposalTitle>{proposal.title}</ListProposalTitle>
                        </HeaderLeft>
                        <HeaderRight>
                          {(proposal.approvalProposalStatus === 'BEFORE_REQUEST_PROPOSAL' || 
                            proposal.approvalProposalStatus === 'REJECTED_BY_ANY_DECISION' || 
                            proposal.approvalProposalStatus === 'REJECTED') && 
                            !window.location.pathname.includes('/project/') && (
                            <SendButton onClick={() => handleSendProposal(proposal.id)}>
                              승인요청
                            </SendButton>
                          )}
                          {proposal.approvalProposalStatus !== 'FINAL_APPROVED' && (
                            <ActionIcons>
                              <ActionIcon onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(proposal);
                              }} title="수정">
                                <FaEdit />
                              </ActionIcon>
                              <ActionIcon className="delete" onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProposal(proposal.id);
                              }} title="삭제">
                                <FaTrashAlt />
                              </ActionIcon>
                            </ActionIcons>
                          )}
                        </HeaderRight>
                      </ProposalHeader>
                    </ProposalContent>
                    <ListProposalInfo>
                      <CreatorInfo>
                        <CompanyName>{proposal.creator.companyName}</CompanyName>
                        <CreatorName>{proposal.creator.name}</CreatorName>
                      </CreatorInfo>
                      <DateInfo>{formatDate(proposal.createdAt)}</DateInfo>
                    </ListProposalInfo>
                  </ProposalItem>
                );
              })}
            </>
          )}
        </ProposalList>
        {!isStageCompleted && !isCustomer && (
          <AddButtonContainer>
            <AddButton onClick={() => { fetchCompanies(); setIsModalOpen(true); }}>
              + 승인요청 추가
            </AddButton>
          </AddButtonContainer>
        )}
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
                <Label>파일 첨부 (선택사항)</Label>
                <FileInputContainer>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <HiddenFileInput
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept="*/*"
                      id="fileInput"
                    />
                    <FileButton 
                      type="button" 
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      파일 선택
                    </FileButton>
                  </div>
                  {files.length > 0 && (
                    <FileList>
                      {Array.from(files).map((file, index) => (
                        <FileItem 
                          key={index}
                          onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                        >
                          <FileContent>
                            <span style={{ fontSize: '16px' }}>📎</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '14px', color: '#1e293b' }}>{file.name}</span>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </FileContent>
                          <DeleteButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDelete(index);
                            }}
                          >
                            ✕
                          </DeleteButton>
                        </FileItem>
                      ))}
                    </FileList>
                  )}
                </FileInputContainer>
              </InputGroup>
              <InputGroup>
                <Label>링크 추가 (선택사항)</Label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <Input
                    type="text"
                    placeholder="링크 제목"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                  <Input
                    type="text"
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    style={{ flex: 2 }}
                  />
                  <FileButton 
                    type="button" 
                    onClick={handleAddLink}
                  >
                    추가
                  </FileButton>
                </div>
                {links.length > 0 && (
                  <FileList>
                    {links.map((link, index) => (
                      <FileItem 
                        key={index}
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <LinkContent>
                          🔗 {link.title}
                        </LinkContent>
                        <DeleteButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLinkDelete(index);
                          }}
                        >
                          ✕
                        </DeleteButton>
                      </FileItem>
                    ))}
                  </FileList>
                )}
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
                      {getApprovalStatusText(selectedProposal.approvalProposalStatus)}
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
                  name="title"
                  value={editingProposal.title || ''}
                  onChange={(e) => setEditingProposal({...editingProposal, title: e.target.value})}
                  placeholder="제목을 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>내용</Label>
                <TextArea
                  name="content"
                  value={editingProposal.content || ''}
                  onChange={(e) => setEditingProposal({...editingProposal, content: e.target.value})}
                  placeholder="내용을 입력하세요"
                />
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <ModalButton onClick={() => setIsEditModalOpen(false)}>취소</ModalButton>
              <ModalButton primary onClick={handleModifyProposal}>저장</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default ApprovalProposal; 