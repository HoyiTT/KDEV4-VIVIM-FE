import React from 'react';
import styled from 'styled-components';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '삭제 확인', 
  message = '정말로 삭제하시겠습니까?',
  confirmText = '삭제',
  cancelText = '취소',
  type = 'delete' // 'delete' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <Message>{message}</Message>
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={onClose}>
            {cancelText}
          </CancelButton>
          <ConfirmButton 
            onClick={onConfirm}
            type={type}
          >
            {confirmText}
          </ConfirmButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.2s ease-out;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const Message = styled.p`
  margin: 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.5;
  text-align: center;
  white-space: pre-line;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const CancelButton = styled(Button)`
  background: #f1f5f9;
  color: #475569;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const ConfirmButton = styled(Button)`
  background: ${props => {
    switch (props.type) {
      case 'delete': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#EF4444';
    }
  }};
  color: white;

  &:hover {
    background: ${props => {
      switch (props.type) {
        case 'delete': return '#DC2626';
        case 'warning': return '#D97706';
        case 'info': return '#2563EB';
        default: return '#DC2626';
      }
    }};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ConfirmModal; 