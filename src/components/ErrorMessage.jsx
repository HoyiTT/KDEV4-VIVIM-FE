import React from 'react';
import styled from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #FEF2F2;
  border: 1px solid #FEE2E2;
  border-radius: 8px;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
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

const ErrorIcon = styled(FaExclamationCircle)`
  color: #DC2626;
  font-size: 16px;
  flex-shrink: 0;
`;

const ErrorText = styled.p`
  color: #991B1B;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
`;

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <ErrorContainer>
      <ErrorIcon />
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
};

export default ErrorMessage; 