import React from 'react';
import styled from 'styled-components';

const Pagination = ({ 
  currentPage, 
  totalElements, 
  pageSize = 10, 
  onPageChange,
  showFirstLast = true,
  maxPageNumbers = 5 
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);
  
  if (totalPages <= 0) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(0, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPageNumbers - 1);

    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(0, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <PaginationContainer>
      {showFirstLast && currentPage > 0 && (
        <PageButton
          onClick={() => onPageChange(0)}
        >
          처음
        </PageButton>
      )}
      {currentPage > 0 && (
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
        >
          이전
        </PageButton>
      )}

      {getPageNumbers().map((pageNum) => (
        <PageButton
          key={pageNum}
          active={currentPage === pageNum}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum + 1}
        </PageButton>
      ))}

      {currentPage < totalPages - 1 && (
        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
        >
          다음
        </PageButton>
      )}
      {showFirstLast && currentPage < totalPages - 1 && (
        <PageButton
          onClick={() => onPageChange(totalPages - 1)}
        >
          마지막
        </PageButton>
      )}
    </PaginationContainer>
  );
};

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? '#E0E7FF' : '#F1F5F9'};
  color: ${props => props.active ? '#3730A3' : '#64748B'};
  font-size: 13px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;

  &:hover {
    background: ${props => props.active ? '#C7D2FE' : '#E2E8F0'};
    color: ${props => props.active ? '#3730A3' : '#475569'};
    transform: none;
  }

  &:active {
    transform: none;
  }
`;

export default Pagination; 