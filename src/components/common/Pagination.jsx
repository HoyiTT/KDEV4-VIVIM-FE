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
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: ${props => props.active ? '#2E7D32' : 'white'};
  color: ${props => props.active ? 'white' : '#1e293b'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.active ? '#1B5E20' : '#f8fafc'};
    border-color: ${props => props.active ? '#1B5E20' : '#cbd5e1'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default Pagination; 