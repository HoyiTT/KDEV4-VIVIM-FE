import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { ApprovalDecisionStatus, ApprovalProposalStatus } from '../constants/enums';
import ApprovalDecision from './ApprovalDecision';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaClock, FaPlus, FaArrowLeft, FaArrowRight, FaEdit, FaTrashAlt, FaEllipsisV, FaEye } from 'react-icons/fa';
import approvalUtils from '../utils/approvalStatus';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import FileLinkUploader from './common/FileLinkUploader';

const { getApprovalStatusText, getApprovalStatusBackgroundColor, getApprovalStatusTextColor } = approvalUtils;

// Styled Components
const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #64748b;
`;

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
`;

const ProposalContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 45px auto;
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
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid #e2e8f0;
  
  &:hover {
    background-color: #f8fafc;
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

const ActionButton = styled.button.attrs({
  className: 'approval-proposal-action-button'
})`
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const DeleteButton = styled.button.attrs({
  className: 'approval-proposal-delete-button'
})`
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

const SendButton = styled(ActionButton).attrs({
  className: 'approval-proposal-send-button'
})`
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
  }
`;

const ShowMoreButton = styled.button.attrs({
  className: 'approval-proposal-show-more-button'
})`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
  
  &:hover {
    background: #f8fafc;
  }
`;

const AddButton = styled.button.attrs({
  className: 'approval-proposal-add-button'
})`
  padding: 12px 24px;
  background: ${props => props.disabled ? '#e2e8f0' : '#2E7D32'};
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
    background: ${props => props.disabled ? '#e2e8f0' : '#1B5E20'};
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

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px 8px 0 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const ModalButtonContainer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: white;
  border-radius: 0 0 8px 8px;
`;

const ApproverSection = styled.div`
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
`;

const CompanyToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #e2e8f0;
  
  &:hover {
    background: #f1f5f9;
  }
  
  span:first-child {
    font-weight: 500;
    color: #1e293b;
  }
  
  span:last-child {
    color: #64748b;
    font-size: 12px;
  }
`;

const EmployeeList = styled.div`
  font-size: 14px;
  background: white;
  padding: 8px 0;
  overflow-y: auto;
`;

const EmployeeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  transition: all 0.2s;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8fafc;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-top: 14px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
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
    border-color: #94a3b8;
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
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
    switch (props.$status) {
      case ApprovalProposalStatus.DRAFT:
        return 'rgba(75, 85, 99, 0.08)';
      case ApprovalProposalStatus.UNDER_REVIEW:
        return 'rgba(30, 64, 175, 0.08)';
      case ApprovalProposalStatus.FINAL_APPROVED:
        return 'rgba(4, 120, 87, 0.08)';
      case ApprovalProposalStatus.FINAL_REJECTED:
        return 'rgba(185, 28, 28, 0.08)';
      default:
        return 'rgba(75, 85, 99, 0.08)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case ApprovalProposalStatus.DRAFT:
        return '#4B5563';
      case ApprovalProposalStatus.UNDER_REVIEW:
        return '#1E40AF';
      case ApprovalProposalStatus.FINAL_APPROVED:
        return '#047857';
      case ApprovalProposalStatus.FINAL_REJECTED:
        return '#B91C1C';
      default:
        return '#4B5563';
    }
  }};
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 14px;
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

const SendButtonSmall = styled.button.attrs({
  className: 'approval-proposal-send-button-small'
})`
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

const ActionIcons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`;

const ActionIcon = styled.button.attrs({
  className: 'approval-proposal-action-icon'
})`
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

const FileButton = styled.button.attrs({
  className: 'approval-proposal-file-button'
})`
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

const EditApproversModal = ({ isOpen, onClose, onSave, projectId, approvalId, proposalStatus }) => {
  const [companies, setCompanies] = useState([]);
  const [companyEmployees, setCompanyEmployees] = useState({});
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [currentApprovers, setCurrentApprovers] = useState([]);
  const [changedApprovers, setChangedApprovers] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // 프로젝트 참여자 목록 가져오기
  const fetchProjectUsers = async () => {
    try {
      if (!projectId) {
        console.log('▶ 프로젝트 ID가 없어 사용자 목록을 조회하지 않습니다.');
        return;
      }

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${projectId}/users`, {
        withCredentials: true
      });
      console.log('▶ 프로젝트 참여자 목록:', data);
      setProjectUsers(data);
    } catch (error) {
      console.error('▶ 프로젝트 사용자 목록 조회 중 오류:', error);
      if (error.response?.status === 401) {
        console.log('▶ 인증이 필요합니다.');
      }
      setProjectUsers([]);
    }
  };

  // 프로젝트 참여자 중 고객사 필터링 함수
  const filterCustomerCompanies = (users) => {
    if (!users.length) return [];
    
    // 프로젝트 참여 회사 중 CLIENT_MANAGER와 CLIENT_USER 역할을 가진 사용자만 필터링
    return users
      .filter(user => user.role === 'CLIENT_MANAGER' || user.role === 'CLIENT_USER')
      .reduce((companies, user) => {
        // 이미 추가된 사용자는 건너뛰기
        if (companies.some(company => company.id === user.userId)) {
          return companies;
        }
        return [...companies, {
          id: user.userId,
          name: user.userName,
          role: user.role
        }];
      }, []);
  };

  // 회사별 직원 목록 조회 함수 수정
  const fetchCompanyEmployees = async (userId) => {
    try {
      // 프로젝트 참여자 목록에서 CLIENT_MANAGER와 CLIENT_USER 역할 사용자만 필터링
      const customerEmployees = projectUsers
        .filter(user => 
          user.userId === userId && 
          (user.role === 'CLIENT_MANAGER' || user.role === 'CLIENT_USER')
        )
        .map(user => ({
          id: user.userId,
          name: user.userName,
          role: user.role
        }));

      console.log('▶ 프로젝트 참여 고객사 직원 목록:', customerEmployees);
      
      setCompanyEmployees(prev => ({
        ...prev,
        [userId]: customerEmployees
      }));
    } catch (error) {
      console.error('▶ 회사 직원 목록 조회 중 오류:', error);
      console.error('▶ 에러 상세:', error.response?.data);
      alert('직원 목록을 불러오는데 실패했습니다.');
    }
  };

  // 프로젝트 참여자 목록이 변경될 때 회사 목록 업데이트
  useEffect(() => {
    if (projectUsers.length > 0) {
      const customerUsers = filterCustomerCompanies(projectUsers);
      console.log('▶ 프로젝트 참여 고객사 목록:', customerUsers);
      
      setCompanies(customerUsers);
      
      // 각 사용자의 정보 가져오기
      customerUsers.forEach(user => {
        fetchCompanyEmployees(user.id);
      });
    }
  }, [projectUsers]);

  const fetchCurrentApprovers = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.APPROVERS(approvalId), {
        withCredentials: true
      });
      console.log('▶ 현재 승인권자 목록:', data);
      
      if (data.approverResponses) {
        // 현재 승인권자 중 고객사 역할을 가진 사용자만 필터링
        const customerApprovers = data.approverResponses.filter(approver => 
          projectUsers.some(user => 
            user.userId === approver.userId && 
            user.role === 'CLIENT_MANAGER'
          )
        );
        
        setCurrentApprovers(customerApprovers);
        // 현재 승인권자들을 selectedApprovers에 추가
        setSelectedApprovers(customerApprovers.map(approver => ({
          userId: approver.userId,
          memberId: approver.userId,
          name: approver.name
        })));
        // 변경된 승인권자 목록 초기화
        setChangedApprovers(new Set());
      }
    } catch (error) {
      console.error('▶ 승인권자 목록 조회 실패:', error);
      setCurrentApprovers([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjectUsers();
      if (approvalId) {
        fetchCurrentApprovers();
      }
    } else {
      setCompanies([]);
      setCompanyEmployees({});
      setExpandedCompanies(new Set());
      setSelectedApprovers([]);
      setProjectUsers([]);
    }
  }, [isOpen, projectId, approvalId]);

  // 승인권자 선택/해제 처리
  const handleSelectApprover = async (employee, checked) => {
    // 현재 승인권자인지 확인
    const isCurrentApprover = currentApprovers.some(approver => approver.userId === employee.id);

    // 승인권자 상태 업데이트
    setSelectedApprovers(prev => {
      const newSelected = checked 
        ? [...prev, { 
            userId: employee.id, 
            memberId: employee.id,
            name: employee.name 
          }] 
        : prev.filter(a => a.userId !== employee.id);
      
      // 변경된 승인권자 추적
      setChangedApprovers(prev => {
        const newChanged = new Set(prev);
        if (isCurrentApprover !== checked) {
          newChanged.add(employee.id);
        } else {
          newChanged.delete(employee.id);
        }
        return newChanged;
      });

      return newSelected;
    });
  };

  const updateApprovers = async (approverIds) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.APPROVAL.UPDATE_APPROVERS(approvalId),
        { approverIds },
        { withCredentials: true }
      );

      // API 응답이 성공적으로 왔으면 성공으로 처리
      if (response.data) {
        alert('승인권자가 성공적으로 수정되었습니다.');
        onClose();
        // 승인권자 목록 새로고침
        fetchCurrentApprovers();
      } else {
        throw new Error('승인권자 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('승인권자 수정 중 오류:', error);
      alert(error.response?.data?.message || '승인권자 수정에 실패했습니다.');
    }
  };

  // 저장 버튼 클릭 시 변경된 승인권자만 처리
  const handleSave = () => {
    // 전체 승인권자 ID 목록 전달
    const allApproverIds = selectedApprovers.map(approver => approver.userId);
    updateApprovers(allApproverIds);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>승인권자 수정</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalContent>
          <ApproverSection>
            {companies.length === 0 ? (
              <EmptyState>연결된 고객사가 없습니다.</EmptyState>
            ) : (
              companies.map(user => (
                <div key={user.id}>
                  <EmployeeList>
                    {(companyEmployees[user.id] || []).map(emp => {
                      const isChanged = changedApprovers.has(emp.id);
                      return (
                        <EmployeeItem 
                          key={emp.id}
                          style={isChanged ? { backgroundColor: '#f8fafc' } : {}}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{emp.name}</span>
                            {isChanged && (
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#2E7D32',
                                backgroundColor: '#f0fdf4',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                변경됨
                              </span>
                            )}
                          </div>
                          <input 
                            type="checkbox" 
                            checked={selectedApprovers.some(a => a.userId === emp.id)} 
                            onChange={e => handleSelectApprover(emp, e.target.checked)} 
                          />
                        </EmployeeItem>
                      );
                    })}
                  </EmployeeList>
                </div>
              ))
            )}
          </ApproverSection>
        </ModalContent>
        <ModalButtonContainer>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <SaveButton 
            onClick={handleSave}
            style={{
              opacity: 1,
              cursor: 'pointer'
            }}
          >
            저장
          </SaveButton>
        </ModalButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

const ApprovalProposal = ({ 
  progressId, 
  projectId,
  showMore, 
  onShowMore,
  stage,
  progressStatus,
  currentProgress
}) => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllProposals, setShowAllProposals] = useState(false);
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
  const [projectUsers, setProjectUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [links, setLinks] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [approvalRate, setApprovalRate] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
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
    console.log('▶ 파일 선택됨:', selectedFiles);
    
    // 파일 크기 검증
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert('10MB 이상의 파일은 업로드할 수 없습니다:\n' + 
        oversizedFiles.map(file => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`).join('\n'));
      e.target.value = ''; // 파일 선택 초기화
      return;
    }

    // 기존 파일 목록에 새로 선택된 파일들 추가
    setFiles(prevFiles => {
      const newFiles = [...prevFiles, ...selectedFiles];
      console.log('▶ 현재 파일 목록:', newFiles);
      return newFiles;
    });
    e.target.value = ''; // 파일 선택 초기화
  };

  // 프로젝트 참여자 목록 가져오기
  const fetchProjectUsers = async () => {
    try {
      if (!projectId) {
        console.log('▶ 프로젝트 ID가 없어 사용자 목록을 조회하지 않습니다.');
        return;
      }

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${projectId}/users`, {
        withCredentials: true
      });
      console.log('▶ 프로젝트 참여자 목록:', data);
      setProjectUsers(data);
    } catch (error) {
      console.error('▶ 프로젝트 사용자 목록 조회 중 오류:', error);
      if (error.response?.status === 401) {
        console.log('▶ 인증이 필요합니다.');
      }
      setProjectUsers([]);
    }
  };

  // 프로젝트 정보 조회 함수 추가
  const fetchProjectInfo = async () => {
    try {
      if (!projectId) {
        console.log('▶ 프로젝트 정보 조회 실패 - 프로젝트 ID 없음');
        return;
      }

      console.log('▶ 프로젝트 정보 조회 시도:', projectId);
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
        withCredentials: true
      });
      console.log('▶ 프로젝트 정보 조회 성공:', data);
      setProjectInfo(data);
    } catch (error) {
      console.error('▶ 프로젝트 정보 조회 실패:', error);
      if (error.response?.status === 401) {
        console.log('▶ 프로젝트 정보 조회 실패 - 인증 필요');
      } else if (error.response?.status === 403) {
        console.log('▶ 프로젝트 정보 조회 실패 - 권한 없음');
      }
      setProjectInfo(null);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectUsers();
      fetchProjectInfo();  // 프로젝트 정보 조회 추가
    }
  }, [projectId]);

  const toggleCompany = async (company) => {
    const newExpandedCompanies = new Set(expandedCompanies);
    if (newExpandedCompanies.has(company.id)) {
      newExpandedCompanies.delete(company.id);
    } else {
      newExpandedCompanies.add(company.id);
    }
    setExpandedCompanies(newExpandedCompanies);
  };

  useEffect(() => {
    if (isModalOpen) {
      // 모달이 열릴 때 fetchProjectUsers가 호출되도록 함
      fetchProjectUsers();
    } else {
      setCompanies([]);
      setCompanyEmployees({});
      setExpandedCompanies(new Set());
      setSelectedApprovers([]);
    }
  }, [isModalOpen]);

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
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.LIST(progressId), {
        withCredentials: true
      });
      setProposals(data.approvalList || []);
      setLoading(false);
      fetchApprovalRate();
    } catch (error) {
      console.error('Error fetching proposals:', error);
      alert(error.response?.data?.message || '승인요청 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleProposalClick = (proposal) => {
    navigate(`/project/${proposal.projectId}/approval/${proposal.id}`);
  };

  const handleAddProposal = async () => {
    console.log('▶ 승인요청 생성 시도 - 사용자 정보:', user);
    console.log('▶ 승인요청 생성 시도 - 프로젝트 정보:', projectInfo);

    if (!newProposal.title.trim() || !newProposal.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      // 1. 승인요청 생성
      console.log('▶ 승인요청 생성 요청 시작:', {
        progressId,
        title: newProposal.title,
        content: newProposal.content
      });

      const { data } = await axiosInstance.post(API_ENDPOINTS.APPROVAL.CREATE(progressId), {
        title: newProposal.title,
        content: newProposal.content
      }, {
        withCredentials: true
      });

      const approvalId = data.data;
      console.log('▶ 승인요청 생성됨, ID:', approvalId);

      // 2. 파일 업로드 처리
      for (const file of files) {
        console.log('▶ 파일 업로드 시도:', file.name, file.size, file.type);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // FormData 내용 확인
        console.log('▶ FormData 내용:');
        for (const [key, value] of formData.entries()) {
          console.log(key, value);
        }

        try {
          const response = await axiosInstance.post(API_ENDPOINTS.APPROVAL.FILES(approvalId), formData, {
            withCredentials: true
          });
          console.log('▶ 파일 업로드 성공:', response.data);
        } catch (uploadError) {
          console.error('▶ 파일 업로드 실패:', uploadError.response?.data || uploadError.message);
          throw uploadError;
        }
      }

      // 3. 링크 저장
      for (const link of links) {
        await axiosInstance.post(API_ENDPOINTS.APPROVAL.LINKS(approvalId), {
          title: link.title,
          url: link.url
        }, {
          withCredentials: true
        });
      }

      // 4. 승인권자 설정
      if (selectedApprovers.length > 0) {
        await axiosInstance.post(API_ENDPOINTS.APPROVAL.CREATE_APPROVER(approvalId), {
          approverIds: selectedApprovers.map(approver => approver.userId)
        }, {
          withCredentials: true
        });
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
      alert(error.response?.data?.message || '승인요청 생성에 실패했습니다.');
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
      const requestBody = {};
      
      if (editingProposal.title !== undefined) {
        requestBody.title = editingProposal.title;
      }
      if (editingProposal.content !== undefined) {
        requestBody.content = editingProposal.content;
      }

      const { data } = await axiosInstance.patch(
        API_ENDPOINTS.APPROVAL.MODIFY(editingProposal.id),
        requestBody,
        {
          withCredentials: true
        }
      );
      
      if (data.statusCode === 201) {
        // 파일 업로드 처리
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            await axiosInstance.post(API_ENDPOINTS.APPROVAL.FILES(editingProposal.id), formData, {
              withCredentials: true
            });
          } catch (uploadError) {
            console.error('▶ 파일 업로드 실패:', uploadError.response?.data || uploadError.message);
            throw uploadError;
          }
        }

        // 링크 저장
        for (const link of links) {
          await axiosInstance.post(API_ENDPOINTS.APPROVAL.LINKS(editingProposal.id), {
            title: link.title,
            url: link.url
          }, {
            withCredentials: true
          });
        }

        setIsEditModalOpen(false);
        setEditingProposal(null);
        setFiles([]);
        setLinks([]);
        setNewLink({ title: '', url: '' });
        fetchProposals();
      } else {
        throw new Error(data.statusMessage || '승인요청 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error modifying proposal:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleEditClick = async (proposal) => {
    try {
      // 승인요청 상세 정보 조회
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.DETAIL(proposal.id));
      
      // 파일 목록 조회
      const { data: filesData } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.FILES(proposal.id));
      
      // 링크 목록 조회
      const { data: linksData } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.LINKS(proposal.id));
      
      setEditingProposal({ ...proposal });
      setFiles(filesData || []);
      setLinks(linksData || []);
      setNewLink({ title: '', url: '' });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching proposal details:', error);
      alert('승인요청 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleDeleteProposal = async (approvalId) => {
    if (!window.confirm('정말로 이 승인요청을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.delete(API_ENDPOINTS.APPROVAL.DELETE(approvalId), {
        withCredentials: true
      });
      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert(error.response?.data?.message || '승인요청 삭제에 실패했습니다.');
    }
  };

  const handleSendProposal = async (approvalId) => {
    try {
      // 전송 전 승인권자 수 확인
      const { data: approversData } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.APPROVERS(approvalId), {
        withCredentials: true
      });
      
      if (!approversData || approversData.approverResponses?.length === 0) {
        window.alert('승인권자가 한 명 이상 등록되어야 승인요청을 전송할 수 있습니다.');
        return;
      }

      const response = await axiosInstance.post(API_ENDPOINTS.APPROVAL.SEND(approvalId), {}, {
        withCredentials: true
      });

      if (response.data) {
        window.alert('승인요청이 성공적으로 전송되었습니다.');
        fetchProposals();
      }
    } catch (error) {
      console.error('승인요청 전송 중 오류:', error);
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes('이미 전송된 승인요청')) {
          window.alert('이미 전송된 승인요청입니다.');
        } else {
          window.alert(error.response.data?.message || '승인요청 전송에 실패했습니다.');
        }
      } else {
        window.alert('승인요청 전송에 실패했습니다.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const isClient = () => {
    if (!user) return false;
    console.log('user companyRole:', user.companyRole);
    return user.companyRole === 'CUSTOMER';
  };

  const canSendProposal = () => {
    if (!user) {
      console.log('▶ 사용자 정보가 없습니다.');
      return false;
    }
    console.log('▶ 현재 사용자 역할:', user.companyRole);
    const canSend = user.companyRole === 'ADMIN' || user.companyRole === 'DEVELOPER';
    console.log('▶ 승인요청 전송 가능 여부:', canSend);
    return canSend;
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      alert('링크 제목과 URL을 모두 입력해주세요.');
      return;
    }

    try {
      new URL(newLink.url);
    } catch (e) {
      alert('올바른 URL 형식이 아닙니다.');
      return;
    }

    setLinks(prevLinks => [...prevLinks, { ...newLink }]);
    
    // 입력 필드 초기화
    setNewLink({ title: '', url: '' });
  };

  const handleLinkDelete = (indexToDelete) => {
    setLinks(prevLinks => prevLinks.filter((_, index) => index !== indexToDelete));
  };

  // 모달이 닫힐 때 상태 초기화
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingProposal(null);
    setFiles([]);
    setLinks([]);
    setNewLink({ title: '', url: '' });
  };

  useEffect(() => {
    if (authLoading) return;
  }, [authLoading]);

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  const handleLinksChange = (newLinks) => {
    setLinks(newLinks);
  };

  // 승인률 조회 함수 수정
  const fetchApprovalRate = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${API_ENDPOINTS.PROJECTS}/${progressId}/approval-rate`,
        { withCredentials: true }
      );
      console.log('▶ 승인률 조회 결과:', data);
      setApprovalRate(data);
      setIsCompleted(data === 100);
    } catch (error) {
      console.error('▶ 승인률 조회 실패:', error);
      setApprovalRate(0);
      setIsCompleted(false);
    }
  };

  // 승인률 조회를 위한 useEffect
  useEffect(() => {
    if (progressId) {
      fetchApprovalRate();
    }
  }, [progressId]);

  const displayedProposals = showAllProposals ? proposals : proposals.slice(0, 5);

  if (loading) {
    return <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>;
  }

  return (
    <Container>
      <ProposalContainer>
        <ProposalList ref={contentRef}>
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
                        <HeaderLeft>
                          <StatusBadge $status={proposal.approvalProposalStatus}>
                            {getApprovalStatusText(proposal.approvalProposalStatus)}
                          </StatusBadge>
                          <ListProposalTitle>{proposal.title}</ListProposalTitle>
                        </HeaderLeft>
                        <HeaderRight>
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
              {proposals.length > 5 && (
                <ShowMoreButton 
                  onClick={() => setShowAllProposals(!showAllProposals)}
                  style={{ 
                    marginTop: '16px',
                    backgroundColor: showAllProposals ? '#f1f5f9' : 'white',
                    color: showAllProposals ? '#475569' : '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '12px',
                    width: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  {showAllProposals ? '접기' : `더보기 (${proposals.length - 5}개 더)`}
                </ShowMoreButton>
              )}
            </>
          )}
        </ProposalList>
        {!Boolean(projectInfo?.isDeleted) && !isCompleted && !isClient() && (
          <AddButtonContainer>
            <AddButton onClick={() => setIsModalOpen(true)}>
              + 승인요청 추가  
            </AddButton>
          </AddButtonContainer>
        )}
      </ProposalContainer>

      {isModalOpen && (
        <EditApproversModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddProposal}
          projectId={projectId}
          approvalId={null}
          proposalStatus={null}
        />
      )}

      {isEditModalOpen && editingProposal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContainer onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>승인요청 수정</ModalTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
            <ModalContent>
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

              <FileLinkUploader
                onFilesChange={handleFilesChange}
                onLinksChange={handleLinksChange}
                initialFiles={files}
                initialLinks={links}
              />

            </ModalContent>
            <ModalButtonContainer>
              <CancelButton onClick={handleCloseModal}>취소</CancelButton>
              <SaveButton onClick={handleModifyProposal}>저장</SaveButton>
            </ModalButtonContainer>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

// EditApproversModal을 ApprovalProposal의 정적 프로퍼티로 추가
ApprovalProposal.EditApproversModal = EditApproversModal;

export default ApprovalProposal; 