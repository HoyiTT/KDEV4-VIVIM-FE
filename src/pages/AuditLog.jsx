import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';
import Select from '../components/common/Select';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    actionType: '',
    entityType: '',
    startDate: '',
    endDate: '',
    userId: '',
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', pageSize);

      if (filters.actionType) queryParams.append('actionType', filters.actionType);
      if (filters.entityType) queryParams.append('entityType', filters.entityType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.userId) queryParams.append('userId', filters.userId);

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.AUDIT_LOGS_SEARCH}?${queryParams.toString()}`);
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('로그를 불러오는데 실패했습니다.');
      setLogs([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getActionTypeColor = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return '#2E7D32';
      case 'UPDATE':
      case 'MODIFY':
        return '#2563eb';
      case 'DELETE':
        return '#EF4444';
      default:
        return '#64748b';
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <HeaderLeft>
            <PageTitle>로그 기록</PageTitle>
            <FilterContainer>
              <Select name="actionType" value={filters.actionType} onChange={handleFilterChange}>
                <option value="">전체</option>
                <option value="CREATE">생성</option>
                <option value="MODIFY">수정</option>
                <option value="DELETE">삭제</option>
              </Select>
              <Select name="entityType" value={filters.entityType} onChange={handleFilterChange}>
                <option value="">전체</option>
                <option value="PROJECT">프로젝트</option>
                <option value="USER">사용자</option>
                <option value="POST">게시글</option>
                <option value="COMMENT">댓글</option>
              </Select>
              <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              <Input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} placeholder="사용자 ID" />
            </FilterContainer>
          </HeaderLeft>
          <HeaderRight>
            <SearchButton onClick={handleSearch}>검색</SearchButton>
          </HeaderRight>
        </Header>

        {loading ? (
          <LoadingMessage>로딩중...</LoadingMessage>
        ) : logs.length === 0 ? (
          <LoadingMessage>데이터가 없습니다.</LoadingMessage>
        ) : (
          <>
            <LogTable>
              <thead>
                <tr>
                  <TableHeaderCell>시간</TableHeaderCell>
                  <TableHeaderCell>사용자 ID</TableHeaderCell>
                  <TableHeaderCell>액션</TableHeaderCell>
                  <TableHeaderCell>대상 타입</TableHeaderCell>
                  <TableHeaderCell>대상 ID</TableHeaderCell>
                  <TableHeaderCell>상세 정보</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.loggedAt)}</TableCell>
                    <TableCell>{log.actorId}</TableCell>
                    <TableCell>
                      <ActionBadge status={log.actionType}>
                        {log.actionType}
                      </ActionBadge>
                    </TableCell>
                    <TableCell>{log.targetType}</TableCell>
                    <TableCell>{log.targetId}</TableCell>
                    <TableCell>
                      {log.details && log.details.length > 0 ? (
                        <DetailsButton onClick={() => handleLogClick(log)}>
                          상세보기
                        </DetailsButton>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </LogTable>
            <PaginationContainer>
              <PaginationButton 
                onClick={() => handlePageChange(0)} 
                disabled={page === 0}
              >
                처음
              </PaginationButton>
              <PaginationButton 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 0}
              >
                이전
              </PaginationButton>
              {(() => {
                const buttons = [];
                const startPage = Math.max(0, page - 5);
                const endPage = Math.min(totalPages - 1, page + 5);

                for (let i = startPage; i <= endPage; i++) {
                  buttons.push(
                    <PaginationButton
                      key={i}
                      onClick={() => handlePageChange(i)}
                      active={page === i}
                    >
                      {i + 1}
                    </PaginationButton>
                  );
                }
                return buttons;
              })()}
              <PaginationButton 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages - 1}
              >
                다음
              </PaginationButton>
              <PaginationButton 
                onClick={() => handlePageChange(totalPages - 1)} 
                disabled={page === totalPages - 1}
              >
                마지막
              </PaginationButton>
            </PaginationContainer>
          </>
        )}

        {showModal && selectedLog && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>변경 상세 정보</ModalTitle>
                <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                {selectedLog.details.map((detail, index) => (
                  <DetailItem key={index}>
                    <DetailField>{detail.fieldName}</DetailField>
                    <DetailValue>
                      <ValueRow>
                        <ValueLabel>이전 값:</ValueLabel>
                        <ValueContent>{detail.oldValue || '-'}</ValueContent>
                      </ValueRow>
                      <ValueRow>
                        <ValueLabel>새로운 값:</ValueLabel>
                        <ValueContent>{detail.newValue || '-'}</ValueContent>
                      </ValueRow>
                    </DetailValue>
                  </DetailItem>
                ))}
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 24px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  letter-spacing: -0.01em;

  &::before {
    content: '';
    display: block;
    width: 3px;
    height: 20px;
    background: #2E7D32;
    border-radius: 1.5px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 120px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
  
  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
  }
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
`;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;
  background: white;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  background: white;
`;

const ActionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    switch (props.status) {
      case 'CREATE': return '#DCFCE7';
      case 'MODIFY': return '#DBEAFE';
      case 'DELETE': return '#FEE2E2';
      default: return '#F8FAFC';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'CREATE': return '#16A34A';
      case 'MODIFY': return '#2563EB';
      case 'DELETE': return '#DC2626';
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

const DetailsButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? '#2E7D32' : 'white'};
  color: ${props => props.active ? 'white' : '#1e293b'};
  border: 1px solid ${props => props.active ? '#2E7D32' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#2E7D32' : '#f8fafc'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    border-color: #e2e8f0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 16px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  min-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailItem = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  align-items: start;
`;

const DetailField = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  word-break: keep-all;
`;

const DetailValue = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
`;

const ValueRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: baseline;
`;

const ValueLabel = styled.span`
  font-weight: 500;
  color: #475569;
  min-width: 80px;
`;

const ValueContent = styled.span`
  flex: 1;
  word-break: break-all;
`;

export default AuditLog;