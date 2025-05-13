import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

const SortableItem = ({ id, name, position, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id,
    disabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
  };

  return (
    <ItemContainer 
      ref={setNodeRef} 
      style={style} 
      {...(!disabled && attributes)} 
      {...(!disabled && listeners)}
      $disabled={disabled}
    >
      <ItemContent>
        <ItemName>{name}</ItemName>
        <ItemPosition>순서: {position}</ItemPosition>
      </ItemContent>
    </ItemContainer>
  );
};

const ItemContainer = styled.div`
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$disabled ? 'white' : '#f8fafc'};
    transform: ${props => props.$disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.$disabled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  }

  &:active {
    cursor: ${props => props.$disabled ? 'not-allowed' : 'grabbing'};
  }
`;

const ItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const ItemPosition = styled.span`
  font-size: 12px;
  color: #64748b;
`;

export default SortableItem;