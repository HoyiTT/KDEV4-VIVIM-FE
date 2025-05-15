import React from 'react';
import styled from 'styled-components';

export const StatusBadge = ({ status, deleted, currentProgress, children }) => {
  return (
    <StyledStatusBadge status={status} deleted={deleted} currentProgress={currentProgress}>
      {children}
    </StyledStatusBadge>
  );
};

export const ProgressBadge = ({ progress, children }) => {
  return (
    <StyledProgressBadge progress={progress}>
      {children}
    </StyledProgressBadge>
  );
};

export const ActionBadge = ({ type = 'primary', size = 'medium', onClick, disabled, hoverable = true, children }) => {
  return (
    <StyledActionBadge type={type} size={size} onClick={onClick} disabled={disabled} $hoverable={hoverable}>
      {children}
    </StyledActionBadge>
  );
};

const StyledStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
  transition: all 0.15s ease;
  background: ${props => {
    if (props.deleted) return '#FEE2E2';
    if (props.currentProgress === 'COMPLETED') return '#F0FDF4';
    return '#E0F2FE';
  }};
  color: ${props => {
    if (props.deleted) return '#B91C1C';
    if (props.currentProgress === 'COMPLETED') return '#15803D';
    return '#0369A1';
  }};

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    margin-right: 6px;
    background: currentColor;
  }
`;

const StyledProgressBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    switch (props.progress) {
      case 'REQUIREMENTS': return '#FEF3C7';
      case 'WIREFRAME': return '#DBEAFE';
      case 'DESIGN': return '#FCE7F3';
      case 'PUBLISHING': return '#DCFCE7';
      case 'DEVELOPMENT': return '#E0E7FF';
      case 'TESTING': return '#FEF9C3';
      case 'DEPLOYMENT': return '#F3E8FF';
      case 'INSPECTION': return '#FEF2F2';
      case 'COMPLETED': return '#F0FDF4';
      default: return '#F1F5F9';
    }
  }};
  color: ${props => {
    switch (props.progress) {
      case 'REQUIREMENTS': return '#92400E';
      case 'WIREFRAME': return '#1E40AF';
      case 'DESIGN': return '#BE185D';
      case 'PUBLISHING': return '#166534';
      case 'DEVELOPMENT': return '#3730A3';
      case 'TESTING': return '#854D0E';
      case 'DEPLOYMENT': return '#6B21A8';
      case 'INSPECTION': return '#B91C1C';
      case 'COMPLETED': return '#15803D';
      default: return '#64748B';
    }
  }};

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    margin-right: 6px;
    background: currentColor;
  }
`;

const StyledActionBadge = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: ${props => props.$hoverable ? 'pointer' : 'default'};
  transition: all 0.15s ease;
  white-space: nowrap;
  letter-spacing: -0.02em;
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 4px 10px;
          font-size: 11px;
        `;
      case 'medium':
        return `
          padding: 6px 12px;
          font-size: 12px;
        `;
      case 'large':
        return `
          padding: 8px 20px;
          font-size: 14px;
        `;
      case 'xlarge':
        return `
          padding: 12px 24px;
          font-size: 15px;
        `;
      default:
        return `
          padding: 6px 12px;
          font-size: 12px;
        `;
    }
  }}

  /* Type variants */
  ${props => {
    switch (props.type) {
      case 'secondary':
        return `
          background: #F1F5F9;
          color: #64748B;
          
          ${props.$hoverable && `
            &:hover:not(:disabled) {
              background: #E2E8F0;
              color: #475569;
            }
          `}
        `;
      case 'danger':
        return `
          background: #FEE2E2;
          color: #B91C1C;
          
          ${props.$hoverable && `
            &:hover:not(:disabled) {
              background: #FECACA;
            }
          `}
        `;
      case 'success':
        return `
          background: #b3f8c9;
          color: #15803D;
          
          ${props.$hoverable && `
            &:hover:not(:disabled) {
              background: #DCFCE7;
            }
          `}
        `;
      default: // primary
        return `
          background: #E0E7FF;
          color: #3730A3;
          
          ${props.$hoverable && `
            &:hover:not(:disabled) {
              background: #C7D2FE;
            }
          `}
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: none;
  }
`; 