import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    content: ''
  });
  const [editingProposal, setEditingProposal] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [progressId]);

  // 승인요청 목록 조회
  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.LIST(progressId), {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('승인요청 목록 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      setProposals(data.approvalList || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      alert('승인요청 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // 승인요청 추가
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

  // 승인요청 수정
  const handleModifyProposal = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.APPROVAL.MODIFY(editingProposal.id), {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingProposal.title,
          content: editingProposal.content
        })
      });

      const result = await response.json();
      
      if (result.statusCode === 0) {
        setIsEditModalOpen(false);
        setEditingProposal(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error modifying proposal:', error);
      alert('승인요청 수정에 실패했습니다.');
    }
  };

  const handleEditClick = (proposal) => {
    setEditingProposal({ ...proposal });
    setIsEditModalOpen(true);
  };

  // 승인요청 삭제
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

      // 목록 새로고침
      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('승인요청 삭제에 실패했습니다.');
    }
  };

  // 승인요청 전송
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

      // 목록 새로고침
      fetchProposals();
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('승인요청 전송에 실패했습니다.');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const displayedProposals = showAll ? proposals : proposals.slice(0, 3);

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
                  <ProposalItem key={proposal.id}>
                    <ProposalContent>
                      <ProposalTitle>{proposal.title}</ProposalTitle>
                      <ProposalDescription>{proposal.content}</ProposalDescription>
                    </ProposalContent>
                    <ProposalInfo>
                      <CreatorInfo>
                        <CompanyName>{proposal.creator.companyName}</CompanyName>
                        <CreatorName>{proposal.creator.name}</CreatorName>
                      </CreatorInfo>
                      <DateInfo>{formatDate(proposal.createdAt)}</DateInfo>
                    </ProposalInfo>
                    <ProposalActions>
                      <StatusBadge
                        background={colors.background}
                        text={colors.text}
                      >
                        {getStatusText(proposal.approvalProposalStatus)}
                      </StatusBadge>
                      <ActionButtons>
                        <ActionButton onClick={() => handleEditClick(proposal)}>
                          수정
                        </ActionButton>
                        <DeleteButton onClick={() => handleDeleteProposal(proposal.id)}>
                          삭제
                        </DeleteButton>
                      </ActionButtons>
                    </ProposalActions>
                    {(proposal.approvalProposalStatus === 'BEFORE_REQUEST_PROPOSAL' || 
                      proposal.approvalProposalStatus === 'REJECTED') && (
                      <SendButton onClick={() => handleSendProposal(proposal.id)}>
                        승인요청 전송
                      </SendButton>
                    )}
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
        <ModalOverlay>
          <ModalContent>
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
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>승인요청 수정</ModalTitle>
              <CloseButton onClick={() => setIsEditModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={editingProposal.title}
                  onChange={(e) => setEditingProposal({
                    ...editingProposal,
                    title: e.target.value
                  })}
                  placeholder="제목을 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>내용</Label>
                <TextArea
                  value={editingProposal.content}
                  onChange={(e) => setEditingProposal({
                    ...editingProposal,
                    content: e.target.value
                  })}
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
    </>
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
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
`;

const ProposalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ProposalTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  text-align: left;
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
`;

const ProposalInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #94a3b8;
`;

const CreatorInfo = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CompanyName = styled.span`
  font-weight: 500;
`;

const CreatorName = styled.span``;

const DateInfo = styled.span``;

const ProposalActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #fef2f2;
  border-color: #fee2e2;
  color: #dc2626;

  &:hover {
    background: #fee2e2;
    color: #b91c1c;
  }
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

const SendButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: white;
  border: 1px solid #2E7D32;
  border-radius: 6px;
  color: #2E7D32;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1B5E20;
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #475569;
`;

const Input = styled.input`
  width: 100%;
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
  width: 100%;
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

export default ApprovalProposal; 