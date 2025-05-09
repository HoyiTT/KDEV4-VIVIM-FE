import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import ApprovalProposal from '../components/ApprovalProposal';
import ProjectPostCreate from './ProjectPostCreate';
import { FaArrowLeft, FaArrowRight, FaPlus, FaCheck, FaClock, FaFlag, FaEdit, FaTrashAlt, FaTimes, FaGripVertical } from 'react-icons/fa';
import ProjectStageProgress from '../components/ProjectStage';
import approvalUtils from '../utils/approvalStatus';
import { ApprovalProposalStatus } from '../constants/enums';
import axiosInstance from '../utils/axiosInstance';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAuth } from '../hooks/useAuth';
import MainContent from '../components/common/MainContent';

const { getApprovalStatusText, getApprovalStatusBackgroundColor, getApprovalStatusTextColor } = approvalUtils;

const PROGRESS_STAGE_MAP = {
  'REQUIREMENTS': '요구사항 정의',
  'WIREFRAME': '화면설계',
  'DESIGN': '디자인',
  'PUBLISHING': '퍼블리싱',
  'DEVELOPMENT': '개발',
  'INSPECTION': '검수',
  'COMPLETED': '완료'
};

const StatusBadge = styled.div`
  padding: 4px 12px;
  border-radius: 4px;
    font-size: 14px;
  font-weight: 500;
  background-color: ${props => props.$isDeleted ? '#ef4444' : '#2E7D32'};
  color: white;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1400px;
  padding: 10px;
  margin: 20px auto;
  box-sizing: border-box;
  width: 100%;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const InfoValue = styled.span`
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
`;

const InfoItemFull = styled(InfoItem)`
  grid-column: 1 / -1;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  position: fixed;
  left: 270px;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 24px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  position: absolute;
  top: 0;
  right: 0;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectInfoSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0px;
`;

const ProjectHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
`;

const ProjectTitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const ProjectTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const ProjectDescription = styled.p`
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
`;

const ProjectSubDescription = styled.p`
  font-size: 14px;
  color: #94a3b8;
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const DateContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
`;

const DateLabel = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

const DateValue = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000;
  margin-top: 8px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &.delete {
    color: #dc2626;
    
    &:hover {
      background: #fee2e2;
    }
  }
`;

const EmptyBoardCell = styled.td`
  text-align: center;
  padding: 48px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
`;

const EmptyStateTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  text-align: center;
`;

const StageSection = styled.div`
  background: transparent;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 0;
  margin-bottom: 16px;
`;

const StageGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 600px;
  overflow: hidden;
`;

const StageItem = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  height: 550px;
  max-height: 550px;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const StageHeader = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding: 0;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
`;

const StageEditActions = styled.div`
  display: flex;
  gap: 8px;
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 5;
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;

  &:hover {
    background: #f1f5f9;
  }
`;

const AddButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  padding-top: 5px;
  margin-top: auto;
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

const BoardSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.$delete ? '#dc2626' : '#2E7D32'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$delete ? '#b91c1c' : '#1B5E20'};
    transform: translateY(-1px);
  }
`;

const BoardTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const BoardHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const BoardCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  min-height: 30px;
  white-space: normal;
  word-break: break-word;
  background: transparent;
  vertical-align: middle;
  line-height: 1.5;

  &.title-cell {
    display: table-cell;
    align-items: center;
    max-width: 400px;
    font-weight: 500;
  }

  &.child-post {
    padding-left: 40px;
  }
`;

const BoardRow = styled.tr`
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const ReplyButton = styled.button`
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #475569;
  }
`;

const ReplyIndicator = styled.span`
  color: #64748b;
  margin-right: 8px;
  font-size: 14px;
`;

const StageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin: 0 auto;
  padding: 1px;
  padding-top: 20px;
  box-sizing: border-box;
`;

const StageTitle = styled.h3`
  margin: 0;
  padding: 5px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  
  &::before {
    content: '${props => props.title || ''}';
  }
  
  &::after {
    content: ': 승인요청 목록보기';
    font-size: 14px;
    font-weight: 400;
    color: #64748b;
    margin-left: 5px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StageSplitLayout = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 10px;
  margin-bottom: 10px;
  flex-direction: column;
`;

// 모달 관련 스타일 컴포넌트 추가
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
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  
  &:hover {
    color: #334155;
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

const ModalButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #e2e8f0;
  }
`;

const ContentSection = styled.div`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-wrap;
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

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const ApprovalDetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalSection = styled.div`
  margin-bottom: 20px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #475569;
  }
  
  p {
    margin: 8px 0;
    line-height: 1.5;
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1e293b;
`;

const ProposalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e293b;
`;

const ProposalInfo = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
`;

const ApprovalDecision = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const StageProgressHeader = styled.div`
  margin-bottom: 20px;
`;

const StageProgressTimeline = styled.div`
  position: relative;
  margin: 30px 0;
  padding: 0 10px;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #2E7D32;
    z-index: 1;
  }
`;

const StageProgressList = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
`;

const StageProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  cursor: pointer;
  ${props => props.active && `
    font-weight: bold;
  `}
`;

const StageProgressMarker = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.completed ? '#2E7D32' : props.current ? '#3b82f6' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  svg {
    color: white;
    font-size: 20px;
  }
`;

const StageProgressDetails = styled.div`
  text-align: center;
`;

const StageProgressName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
`;

const StageProgressStatus = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const StageProgressInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 32px;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 20px;
`;

const ProgressInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.width};
  height: 100%;
  background-color: #2E7D32;
  border-radius: 2px;
`;

// 새로 추가된 스타일 컴포넌트
const StageHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StageActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const StageActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f3f4f6;
    color: #4f46e5;
  }
`;

const StageModalContent = styled(ModalContent)`
  max-width: 500px;
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #374151;
`;

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.2);
  }
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const ActionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ActionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  position: relative;
  padding-left: 16px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #2E7D32;
    border-radius: 2px;
  }
`;

const EmptyStageMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const AddStageButton = styled.button`
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338ca;
  }
  
  &.delete {
    background-color: #ef4444;
    
    &:hover {
      background-color: #dc2626;
    }
  }
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const DeleteConfirmMessage = styled.div`
  padding: 16px;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 4px;
  margin: 16px 0;
  text-align: center;
  font-weight: 500;
`;

const DragInstructions = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
`;

const StageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SortableItem = ({ id, name, position }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableStageItem ref={setNodeRef} style={style}>
      <DragHandle {...attributes} {...listeners}>
        <FaGripVertical />
      </DragHandle>
      <StageItemContent>
        <StageItemName>{name}</StageItemName>
        <StageItemPosition>{position}번째</StageItemPosition>
      </StageItemContent>
    </SortableStageItem>
  );
};

const SortableStageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: grab;
  padding: 8px;
  
  &:active {
    cursor: grabbing;
  }
`;

const StageItemContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StageItemName = styled.div`
  font-weight: 500;
  color: #1e293b;
`;

const StageItemPosition = styled.div`
  color: #64748b;
  font-size: 14px;
`;

const ListButton = styled.button`
  padding: 8px 16px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
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

const ToggleSection = styled.div`
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ToggleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: ${props => props.$isOpen ? '1px solid #e2e8f0' : 'none'};

  &:hover {
    background-color: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 14px;
    transition: transform 0.2s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const ToggleTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #2E7D32;
    border-radius: 2px;
  }
`;

const ToggleContent = styled.div`
  padding: ${props => props.$isOpen ? '20px' : '0'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
`;

const ToggleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const ToggleLabel = styled.span`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const ToggleValue = styled.span`
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
`;

const NotificationOverlay = styled(ModalOverlay)`
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const NotificationPanel = styled(ModalContent)`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  border-radius: 0;
  margin: 0;
  padding: 0;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
`;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isClient, isDeveloperManager } = useAuth();
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const stageRefs = useRef([]);
  const [showAll, setShowAll] = useState(false);
  const [progressList, setProgressList] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalRequestsForStage, setApprovalRequestsForStage] = useState([]);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageAction, setStageAction] = useState('');
  const [editingStage, setEditingStage] = useState(null);
  const [stageName, setStageName] = useState('');
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [statusSummary, setStatusSummary] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [projectProgress, setProjectProgress] = useState({
    totalStageCount: 0,
    completedStageCount: 0,
    currentStageProgressRate: 0,
    overallProgressRate: 0
  });

  const [progressStatus, setProgressStatus] = useState({
    progressList: []
  });

  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  const [isIncreasing, setIsIncreasing] = useState(false);

  const [stages, setStages] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(false);

  const [companyInfo, setCompanyInfo] = useState(null);
  const [clientUserInfo, setClientUserInfo] = useState(null);
  const [devUserInfo, setDevUserInfo] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (progressList) {
      setStages(progressList.map(stage => ({
        id: stage.id,
        name: stage.name,
        position: stage.position,
        isCompleted: stage.isCompleted
      })));
    }
  }, [progressList]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index + 1
        }));

        // progressList도 함께 업데이트
        setProgressList(prev => 
          prev.map(item => {
            const updatedItem = updatedItems.find(updated => updated.id === item.id);
            return updatedItem ? { ...item, position: updatedItem.position } : item;
          }).sort((a, b) => a.position - b.position)
        );

        return updatedItems;
      });
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        const response = await axiosInstance.delete(`${API_ENDPOINTS.PROJECTS}/${id}`, {
          withCredentials: true,
          data: {
            projectId: id,
            deleteReason: '사용자에 의한 삭제'
          }
        });
        
        if (response.data.statusCode === 200) {
          alert('프로젝트가 삭제되었습니다.');
          navigate('/admin/projects');
        } else {
          alert('프로젝트 삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        if (error.response?.status === 403) {
          alert('프로젝트를 삭제할 권한이 없습니다.');
        } else {
          alert('프로젝트 삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  useEffect(() => {
    fetchProjectDetail();
    fetchProjectPosts();
    fetchProjectProgress();
    fetchApprovalRequests();
    fetchProjectOverallProgress();
    fetchProgressStatus();

    // 회사 정보 조회 추가
    if (isAdmin || isClient || isDeveloperManager) {
      fetchCompanyInfo();
      fetchClientUserInfo();
      fetchDevUserInfo();
    }

    // 30초마다 데이터 업데이트
    const updateInterval = setInterval(() => {
      fetchProjectOverallProgress();
      fetchProgressStatus();
    }, 30000);

    return () => {
      clearInterval(updateInterval);
    };
  }, [id]);

  // 현재 단계가 변경될 때마다 진행률 다시 계산
  useEffect(() => {
    if (progressList.length > 0) {
      fetchProjectOverallProgress();
      fetchProgressStatus();
    }
  }, [currentStageIndex]);

  // 승인요청 상태가 변경될 때마다 진행률 다시 계산
  useEffect(() => {
    if (approvalRequests.length > 0) {
      fetchProjectOverallProgress();
      fetchProgressStatus();
    }
  }, [approvalRequests]);

  // 진행률 데이터 업데이트 함수
  const updateProgressData = async () => {
    try {
      await Promise.all([
        fetchProjectOverallProgress(),
        fetchProgressStatus()
      ]);
    } catch (error) {
      console.error('진행률 데이터 업데이트 중 오류 발생:', error);
    }
  };

  // 승인요청 상태 변경 시 진행률 업데이트
  const handleApprovalStatusChange = () => {
    updateProgressData();
  };

  const translateRole = (role) => {
    switch (role) {
      case 'DEVELOPER':
        return '개발사';
      case 'CLIENT':
        return '의뢰인';
      case 'ADMIN':
        return '관리자';
      default:
        return '일반';
    }
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'DEVELOPER':
        return {
          background: '#dbeafe',
          border: '#93c5fd',
          text: '#2563eb'
        };
      case 'CLIENT':
        return {
          background: '#fef9c3',
          border: '#fde047',
          text: '#ca8a04'
        };
      case 'ADMIN':
        return {
          background: '#fee2e2',
          border: '#fca5a5',
          text: '#dc2626'
        };
      default:
        return {
          background: '#f1f5f9',
          border: '#e2e8f0',
          text: '#64748b'
        };
    }
  };

  const fetchProjectProgress = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${id}/progress`, {
        withCredentials: true
      });
      console.log('Progress 조회 응답:', data);
      
      // 새로 추가된 단계의 isCompleted 값을 false로 설정
      const updatedProgressList = data.progressList.map(progress => ({
        ...progress,
        isCompleted: progress.isCompleted && progress.id !== data.progressList[data.progressList.length - 1]?.id
      }));
      
      setProgressList(updatedProgressList);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchProjectDetail = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${id}`, {
        withCredentials: true
      });
      setProject(data);
      
      // 현재 진행 단계 설정
      if (data.currentProgress && progressList.length > 0) {
        const currentStageIndex = progressList.findIndex(
          stage => stage.position === data.currentProgress
        );
        if (currentStageIndex !== -1) {
          setCurrentStageIndex(currentStageIndex);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  const fetchProjectPosts = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${id}/posts`, {
        withCredentials: true
      });
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchProjectOverallProgress = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${id}/progress/overall-progress`, {
        withCredentials: true
      });
      setProjectProgress(data);
    } catch (error) {
      console.error('전체 진행률 조회 실패:', error);
      if (error.response?.status === 403) {
        console.log('권한이 없습니다. 로그인이 필요합니다.');
      }
    }
  };

  const fetchProgressStatus = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${id}/progress/status`, {
        withCredentials: true
      });
      setProgressStatus(data);
    } catch (error) {
      console.error('상태별 진행률 조회 실패:', error);
      if (error.response?.status === 403) {
        console.log('권한이 없습니다. 로그인이 필요합니다.');
      }
    }
  };

  const fetchApprovalRequests = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.PROJECTS}/${id}/approval-requests`, {
        withCredentials: true
      });
      setApprovalRequests(data);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.COMPANY_INFO}`, {
        withCredentials: true
      });
      setCompanyInfo(data);
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const fetchClientUserInfo = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.CLIENT_USER_INFO}`, {
        withCredentials: true
      });
      setClientUserInfo(data);
    } catch (error) {
      console.error('Error fetching client user info:', error);
    }
  };

  const fetchDevUserInfo = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.DEVELOPER_USER_INFO}`, {
        withCredentials: true
      });
      setDevUserInfo(data);
    } catch (error) {
      console.error('Error fetching developer user info:', error);
    }
  };

  return (
    <PageContainer>
      {/* Rest of the component content remains unchanged */}
    </PageContainer>
  );
};

export default ProjectDetail;
