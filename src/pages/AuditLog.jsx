import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';
import Select from '../components/common/Select';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    actionType: '',
    targetType: '',
    startDate: '',
    endDate: '',
    userId: '',
    size: 10,
  });
  const [cursor, setCursor] = useState({ loggedAt: '', id: '' });
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorStack, setCursorStack] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (customCursor = null) => {
    try {
      setLoading(true);
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          params[key] = value;
        }
      });
      if (customCursor && customCursor.loggedAt && customCursor.id) {
        params.cursorLoggedAt = customCursor.loggedAt;
        params.cursorId = customCursor.id;
      }
      const { data } = await axiosInstance.get(`/auditLog/searchCursor`, { params });
      setLogs(data.logs || []);
      setNextCursor(data.nextCursor || null);
      setCursor(customCursor || { loggedAt: '', id: '' });
    } catch (error) {
      setLogs([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCursor({ loggedAt: '', id: '' });
    setCursorStack([]);
    fetchLogs(null);
  };

  const handleNext = () => {
    if (nextCursor) {
      setCursorStack(prev => [...prev, cursor]);
      fetchLogs(nextCursor);
    }
  };

  const handlePrev = () => {
    if (cursorStack.length > 0) {
      const prevStack = [...cursorStack];
      const prevCursor = prevStack.pop();
      setCursorStack(prevStack);
      fetchLogs(prevCursor);
    }
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

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <HeaderLeft>
            <PageTitle>로그 기록</PageTitle>
            <FilterContainer>
              <select
                name="actionType"
                value={filters.actionType}
                onChange={handleFilterChange}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '120px',
                  marginRight: '0'
                }}
              >
                <option value="">--</option>
                <option value="CREATE">CREATE</option>
                <option value="MODIFY">MODIFY</option>
                <option value="DELETE">DELETE</option>
              </select>
              <select
                name="targetType"
                value={filters.targetType}
                onChange={handleFilterChange}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '120px',
                  marginRight: '0'
                }}
              >
                <option value="">--</option>
                <option value="USER">USER</option>
                <option value="COMPANY">COMPANY</option>
                <option value="PROJECT">PROJECT</option>
                <option value="APPROVAL">APPROVAL</option>
                <option value="PHASE">PHASE</option>
                <option value="POST">POST</option>
                <option value="COMMENT">COMMENT</option>
                <option value="LINK">LINK</option>
              </select>
              <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              <Input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} placeholder="사용자 ID" />
              <Input type="number" name="size" value={filters.size} onChange={handleFilterChange} min={1} max={100} style={{ width: 80 }} />
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
                onClick={handlePrev} 
                disabled={cursorStack.length === 0}
              >
                이전
              </PaginationButton>
              <PaginationButton 
                onClick={handleNext} 
                disabled={!nextCursor}
              >
                다음
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
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &[type="date"] {
    width: 140px;
  }
  
  &[type="text"] {
    width: 120px;
  }
  
  &[type="number"] {
    width: 80px;
  }
  
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