import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
`;

const ToastNotification = ({ notification, onClose, index }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case 'PROJECT_CREATED':
        return { label: '프로젝트 생성', color: '#2E7D32' };
      case 'PROJECT_MODIFIED':
        return { label: '프로젝트 수정', color: '#2E7D32' };
      case 'PROJECT_DELETED':
        return { label: '프로젝트 삭제', color: '#ef4444' };
      case 'PROPOSAL_CREATED':
        return { label: '승인요청 생성', color: '#2563eb' };
      case 'PROPOSAL_MODIFIED':
        return { label: '승인요청 수정', color: '#2563eb' };
      case 'PROPOSAL_DELETED':
        return { label: '승인요청 삭제', color: '#ef4444' };
      case 'DECISION_CREATED':
        return { label: '승인응답 생성', color: '#7c3aed' };
      case 'DECISION_MODIFIED':
        return { label: '승인응답 수정', color: '#7c3aed' };
      case 'DECISION_DELETED':
        return { label: '승인응답 삭제', color: '#ef4444' };
      default:
        return { label: '알림', color: '#64748b' };
    }
  };

  const { label, color } = getNotificationTypeInfo(notification.type);

  return (
    <ToastContainer $color={color} $index={index}>
      <ToastHeader>
        <ToastType>{label}</ToastType>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </ToastHeader>
      <ToastContent>{notification.content}</ToastContent>
      <ToastTime>
        {new Date(notification.createdAt).toLocaleString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </ToastTime>
    </ToastContainer>
  );
};

const ToastContainer = styled.div`
  position: fixed;
  top: ${props => 24 + (props.$index * 120)}px;
  left: 340px;  /* Sidebar(300px) + 여백(40px) */
  width: 320px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid ${props => props.$color};
  animation: ${slideIn} 0.3s ease-out forwards;
  z-index: ${props => 9999 - props.$index};

  &.closing {
    animation: ${slideOut} 0.3s ease-in forwards;
  }
`;

const ToastHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ToastType = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  border-radius: 4px;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ToastContent = styled.div`
  font-size: 14px;
  color: #334155;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const ToastTime = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: right;
`;

export default ToastNotification; 