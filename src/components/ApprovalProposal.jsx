import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';

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

const ApprovalProposal = ({ progressId }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, [progressId]);

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.LIST(progressId), {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setProposals(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'BEFORE_REQUEST_PROPOSAL':
        return '요청 전';
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

  if (loading) {
    return <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>;
  }

  return (
    <ProposalContainer>
      <ProposalList>
        {proposals.length === 0 ? (
          <EmptyState>등록된 승인요청이 없습니다.</EmptyState>
        ) : (
          proposals.map((proposal) => {
            const colors = getStatusColor(proposal.status);
            return (
              <ProposalItem key={proposal.id}>
                <ProposalContent>
                  <ProposalTitle>{proposal.title}</ProposalTitle>
                  <ProposalDescription>{proposal.description}</ProposalDescription>
                </ProposalContent>
                <StatusBadge
                  background={colors.background}
                  text={colors.text}
                >
                  {getStatusText(proposal.status)}
                </StatusBadge>
              </ProposalItem>
            );
          })
        )}
      </ProposalList>
      <AddButton onClick={() => console.log('Add proposal')}>
        승인요청 추가하기
      </AddButton>
    </ProposalContainer>
  );
};

const ProposalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
`;

const ProposalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProposalTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const ProposalDescription = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const StatusBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.background};
  color: ${props => props.text};
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

export default ApprovalProposal; 