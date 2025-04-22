import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import { ApprovalDecisionStatus } from '../constants/enums';

// Styled Components
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
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
  position: relative;
  ${props => props.isCompleted && `
    background: #f1f5f9;
    border-color: #e2e8f0;
  `}
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const ResponseStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
`;

const ResponseName = styled.div`
  font-size: 14px;
  font-weight: 600;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ResponseStatus = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
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
  flex: 1;
  text-align: left;
  
  strong {
    font-weight: 500;
    color: #1e293b;
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
  margin: 12px 0;
`;

const ResponseButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: #2E7D32;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;

  &:hover {
    background: #1B5E20;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  box-sizing: border-box;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
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

  &:focus {
    outline: none;
    border-color: #2E7D32;
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
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }

  option {
    padding: 12px;
  }
`;

const CancelButton = styled(ResponseButton)`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const SaveButton = styled(ResponseButton)`
  background: #2E7D32;
  color: white;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #1B5E20;
  }
`;

const DeleteButton = styled.button`
  padding: 4px 8px;
  background: #fee2e2;
  border: none;
  border-radius: 4px;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fecaca;
  }
`;

const CompletedBadge = styled.span`
  background-color: #dcfce7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #16a34a;
  margin-left: 8px;
`;

const CompletedMessage = styled.div`
  padding: 12px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

const ApprovalDecision = ({ approvalId }) => {
  const [proposals, setProposals] = useState([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [newDecision, setNewDecision] = useState({
    content: '',
    status: ''
  });
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [expandedApprovers, setExpandedApprovers] = useState(new Set());

  useEffect(() => {
    fetchDecisions();
  }, [approvalId]);

  const fetchDecisions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DECISION.LIST(approvalId), {
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
      console.log('Fetched decisions:', data);
      setProposals(data.items || []);
    } catch (error) {
      console.error('Error fetching decisions:', error);
      alert(error.message || '승인응답 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleCreateDecision = async () => {
    if (!newDecision.status) {
      alert('승인 상태를 선택해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DECISION.CREATE(approvalId), {
        method: 'POST',
        headers: {
          'Authorization': token,
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
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Create decision response:', data);

      setIsInputOpen(false);
      setNewDecision({ content: '', status: '' });
      setSelectedApprover(null);
      await fetchDecisions();
    } catch (error) {
      console.error('Error creating decision:', error);
      alert(error.message || '승인응답 생성에 실패했습니다.');
    }
  };

  const handleDeleteDecision = async (decisionId) => {
    if (!window.confirm('정말로 이 응답을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DECISION.DELETE(decisionId), {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      await fetchDecisions();
    } catch (error) {
      console.error('Error deleting decision:', error);
      alert(error.message || '응답 삭제에 실패했습니다.');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ApprovalDecisionStatus.APPROVED:
        return '승인';
      case ApprovalDecisionStatus.REJECTED:
        return '거절';
      default:
        return '대기중';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const hasApprovedDecision = (approver) => {
    return approver.decisionList.some(decision => 
      decision.status === ApprovalDecisionStatus.APPROVED
    );
  };

  const sortApprovers = (approvers) => {
    return [...approvers].sort((a, b) => {
      const aCompleted = hasApprovedDecision(a);
      const bCompleted = hasApprovedDecision(b);
      if (aCompleted === bCompleted) return 0;
      return aCompleted ? 1 : -1;
    });
  };

  const toggleApproverExpansion = (approverId) => {
    setExpandedApprovers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(approverId)) {
        newSet.delete(approverId);
      } else {
        newSet.add(approverId);
      }
      return newSet;
    });
  };

  return (
    <ResponseSection>
      <ResponseList>
        {proposals.length === 0 ? (
          <EmptyResponseMessage>승인권자가 없습니다.</EmptyResponseMessage>
        ) : (
          sortApprovers(proposals[0].approvers).map((approver) => (
            <ResponseItem 
              key={approver.approverId}
              isCompleted={hasApprovedDecision(approver)}
            >
              <ResponseHeader>
                <ResponseName>
                  {approver.approverName}
                  {hasApprovedDecision(approver) && (
                    <CompletedBadge>승인 완료</CompletedBadge>
                  )}
                </ResponseName>
              </ResponseHeader>
              {hasApprovedDecision(approver) ? (
                <>
                  <CompletedMessage 
                    onClick={() => toggleApproverExpansion(approver.approverId)}
                  >
                    지난 응답내역 다시보기
                  </CompletedMessage>
                  {expandedApprovers.has(approver.approverId) && (
                    <>
                      {approver.decisionList.map((decision) => (
                        <div key={decision.id} style={{ marginBottom: '16px' }}>
                          <ResponseHeader>
                            <ResponseStatusContainer>
                              <ResponseStatus status={decision.status}>
                                {getStatusText(decision.status)}
                              </ResponseStatus>
                            </ResponseStatusContainer>
                            <ResponseDate>{formatDate(decision.decidedAt)}</ResponseDate>
                          </ResponseHeader>
                          <ResponseContent>
                            <ResponseText>
                              {decision.title && <strong>{decision.title}</strong>}
                              {decision.content && <div>{decision.content}</div>}
                              {!decision.title && !decision.content && '내용 없음'}
                            </ResponseText>
                          </ResponseContent>
                          <ResponseActionsContainer>
                            <DeleteButton onClick={() => handleDeleteDecision(decision.id)}>
                              삭제
                            </DeleteButton>
                          </ResponseActionsContainer>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  {approver.decisionList.length > 0 ? (
                    <>
                      {approver.decisionList.map((decision) => (
                        <div key={decision.id} style={{ marginBottom: '16px' }}>
                          <ResponseHeader>
                            <ResponseStatusContainer>
                              <ResponseStatus status={decision.status}>
                                {getStatusText(decision.status)}
                              </ResponseStatus>
                            </ResponseStatusContainer>
                            <ResponseDate>{formatDate(decision.decidedAt)}</ResponseDate>
                          </ResponseHeader>
                          <ResponseContent>
                            <ResponseText>
                              {decision.title && <strong>{decision.title}</strong>}
                              {decision.content && <div>{decision.content}</div>}
                              {!decision.title && !decision.content && '내용 없음'}
                            </ResponseText>
                          </ResponseContent>
                          <ResponseActionsContainer>
                            <DeleteButton onClick={() => handleDeleteDecision(decision.id)}>
                              삭제
                            </DeleteButton>
                          </ResponseActionsContainer>
                        </div>
                      ))}
                      {isInputOpen && selectedApprover?.approverId === approver.approverId ? (
                        <div style={{ marginTop: '16px', width: '100%' }}>
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
                          <ResponseActionsContainer>
                            <CancelButton onClick={() => {
                              setIsInputOpen(false);
                              setSelectedApprover(null);
                              setNewDecision({ content: '', status: '' });
                            }}>취소</CancelButton>
                            <SaveButton onClick={handleCreateDecision}>저장</SaveButton>
                          </ResponseActionsContainer>
                        </div>
                      ) : (
                        <ResponseButton onClick={() => {
                          setIsInputOpen(true);
                          setSelectedApprover(approver);
                          setNewDecision({ content: '', status: '' });
                        }}>
                          <span>+</span>
                          <span>승인응답 추가</span>
                        </ResponseButton>
                      )}
                    </>
                  ) : (
                    <>
                      <EmptyResponseMessage>아직 응답이 없습니다.</EmptyResponseMessage>
                      {isInputOpen && selectedApprover?.approverId === approver.approverId ? (
                        <div style={{ marginTop: '16px', width: '100%' }}>
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
                          <ResponseActionsContainer>
                            <CancelButton onClick={() => {
                              setIsInputOpen(false);
                              setSelectedApprover(null);
                              setNewDecision({ content: '', status: '' });
                            }}>취소</CancelButton>
                            <SaveButton onClick={handleCreateDecision}>저장</SaveButton>
                          </ResponseActionsContainer>
                        </div>
                      ) : (
                        <ResponseButton onClick={() => {
                          setIsInputOpen(true);
                          setSelectedApprover(approver);
                          setNewDecision({ content: '', status: '' });
                        }}>
                          <span>+</span>
                          <span>승인응답 추가</span>
                        </ResponseButton>
                      )}
                    </>
                  )}
                </>
              )}
            </ResponseItem>
          ))
        )}
      </ResponseList>
    </ResponseSection>
  );
};

export default ApprovalDecision; 