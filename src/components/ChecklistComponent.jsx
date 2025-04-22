import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config/api';

const ChecklistComponent = ({ progressId }) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [editName, setEditName] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const toggleDisabled = () => {
    setIsDisabled(!isDisabled);
  };

  const fetchChecklists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/progress/${progressId}/checklists`, {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setChecklists(data.allChecklist || []);
      // setIsDisabled(data.isDisabled || false); // 임시로 주석 처리
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, [progressId]);

  if (loading) return <LoadingText>로딩중...</LoadingText>;

  const handleAddChecklist = async () => {
    if (!newChecklistName.trim() || isDisabled) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/progress/${progressId}/checklists`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newChecklistName
        })
      });
      
      if (response.ok) {
        await fetchChecklists();
        setNewChecklistName('');
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error adding checklist:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (isDisabled) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/progress/${checklistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
      
      if (response.ok) {
        await fetchChecklists();
      }
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
  };

  const handleEditChecklist = async (checklistId) => {
    if (!editName.trim() || isDisabled) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/progress/${checklistId}?name=${encodeURIComponent(editName)}`, {
        method: 'PUT',
        headers: {
          'Authorization': token
        }
      });
      
      if (response.ok) {
        await fetchChecklists();
        setIsEditing(null);
        setEditName('');
      }
    } catch (error) {
      console.error('Error editing checklist:', error);
    }
  };

  return (
    <ChecklistContainer isDisabled={isDisabled}>
      <ToggleButton onClick={toggleDisabled}>
        {isDisabled ? '활성화하기' : '비활성화하기'}
      </ToggleButton>
      {isDisabled && (
        <DisabledOverlay>
          <DisabledText>이 단계는 비활성화되었습니다</DisabledText>
        </DisabledOverlay>
      )}
      {checklists.length > 0 ? (
        <ChecklistList>
          {checklists.map((item) => (
            <ChecklistItemContainer key={item.id} isDisabled={isDisabled}>
              {isEditing === item.id ? (
                <ChecklistInput
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEditChecklist(item.id)}
                  placeholder="체크리스트 이름 입력"
                  disabled={isDisabled}
                />
              ) : (
                <ChecklistName>{item.name}</ChecklistName>
              )}
              <ChecklistActions>
                {isEditing === item.id ? (
                  <>
                    <CancelButton onClick={() => {
                      setIsEditing(null);
                      setEditName('');
                    }} disabled={isDisabled}>취소</CancelButton>
                    <SaveButton onClick={() => handleEditChecklist(item.id)} disabled={isDisabled}>저장</SaveButton>
                  </>
                ) : (
                  <>
                    <EditButton onClick={() => {
                      setIsEditing(item.id);
                      setEditName(item.name);
                    }} disabled={isDisabled}>수정</EditButton>
                    <DeleteButton onClick={() => handleDeleteChecklist(item.id)} disabled={isDisabled}>삭제</DeleteButton>
                  </>
                )}
              </ChecklistActions>
            </ChecklistItemContainer>
          ))}
        </ChecklistList>
      ) : (
        <EmptyMessage>체크리스트가 없습니다</EmptyMessage>
      )}
      
      {isAdding ? (
        <AddChecklistForm>
          <ChecklistInput
            type="text"
            placeholder="체크리스트 이름 입력"
            value={newChecklistName}
            onChange={(e) => setNewChecklistName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddChecklist()}
            disabled={isDisabled}
          />
          <ButtonGroup>
            <CancelButton onClick={() => setIsAdding(false)} disabled={isDisabled}>취소</CancelButton>
            <SaveButton onClick={handleAddChecklist} disabled={isDisabled}>저장</SaveButton>
          </ButtonGroup>
        </AddChecklistForm>
      ) : (
        <AddChecklistButton onClick={() => setIsAdding(true)} disabled={isDisabled}>
          + 체크리스트 추가
        </AddChecklistButton>
      )}
    </ChecklistContainer>
  );
};

const ChecklistContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: ${props => props.isDisabled ? 0.5 : 1};
`;

const DisabledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 6px;
`;

const DisabledText = styled.span`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  background: white;
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AddChecklistForm = styled.div`
  margin-top: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  background-color: white;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AddChecklistButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${props => props.disabled ? '#2E7D32' : '#1B5E20'};
  }
`;

const ChecklistInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #94a3b8;
  }

  &:disabled {
    background-color: #f1f5f9;
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  padding: 15px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  margin-bottom: 24px;
  min-height: 90px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? '#f1f5f9' : '#e2e8f0'};
  }
`;

const ChecklistList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  flex-grow: 1;
  margin-bottom: 24px;
`;

const ChecklistItemContainer = styled.li`
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: ${props => props.isDisabled ? 0.5 : 1};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    border-color: ${props => props.isDisabled ? '#e2e8f0' : '#cbd5e1'};
    box-shadow: ${props => props.isDisabled ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  }
`;

const ChecklistName = styled.span`
  font-size: 14px;
  color: #1e293b;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChecklistActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  width: 100%;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  padding: 16px;
`;

const EditButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #4F6AFF;
  border: 1px solid #4F6AFF;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : '#f0f5ff'};
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : '#fef2f2'};
  }
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.disabled ? '#2E7D32' : '#1B5E20'};
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  padding: 6px 12px;
  background: ${props => props.isDisabled ? '#2E7D32' : '#dc2626'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 20;

  &:hover {
    background: ${props => props.isDisabled ? '#1B5E20' : '#b91c1c'};
  }
`;

export default ChecklistComponent;