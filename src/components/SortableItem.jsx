import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

const SortableItem = ({ id, name, position }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ItemContainer ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
  cursor: grab;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  &:active {
    cursor: grabbing;
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