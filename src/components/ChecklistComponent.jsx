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
    if (!newChecklistName.trim()) return;
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
    if (!editName.trim()) return;
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

  // Update the return JSX for checklist items
  return (
    <ChecklistContainer>
      {checklists.length > 0 ? (
        <ChecklistList>
          {checklists.map((item) => (
            <ChecklistItemContainer key={item.id}>
              {isEditing === item.id ? (
                <ChecklistInput
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEditChecklist(item.id)}
                  placeholder="체크리스트 이름 입력"
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
                    }}>취소</CancelButton>
                    <SaveButton onClick={() => handleEditChecklist(item.id)}>저장</SaveButton>
                  </>
                ) : (
                  <>
                    <EditButton onClick={() => {
                      setIsEditing(item.id);
                      setEditName(item.name);
                    }}>수정</EditButton>
                    <DeleteButton onClick={() => handleDeleteChecklist(item.id)}>삭제</DeleteButton>
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
          />
          <ButtonGroup>
            <CancelButton onClick={() => setIsAdding(false)}>취소</CancelButton>
            <SaveButton onClick={handleAddChecklist}>저장</SaveButton>
          </ButtonGroup>
        </AddChecklistForm>
      ) : (
        <AddChecklistButton onClick={() => setIsAdding(true)}>
          + 체크리스트 추가
        </AddChecklistButton>
      )}
    </ChecklistContainer>
  );
};

const AddChecklistForm = styled.div`
  margin-top: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  background-color: white;
  min-height: 90px;  // Increased height
  display: flex;
  flex-direction: column;  // Back to column layout
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
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  padding: 15px;  // Changed to match ChecklistItemContainer padding
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  margin-bottom: 24px;
  min-height: 90px;  // Added to match other containers
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
  
  &:hover {
    background-color: #e2e8f0;
  }
`;

const ChecklistContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
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
  gap: 16px;  // Changed from 12px to 16px for even more spacing
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

export default ChecklistComponent;

// Add these new styled components
const EditButton = styled.button`
    padding: 6px 12px;
    background: transparent;
    color: #4F6AFF;
    border: 1px solid #4F6AFF;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    
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
  
  &:hover {
    background-color: #2E7D32;
  }
`;