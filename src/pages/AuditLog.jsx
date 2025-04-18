import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import Navbar from '../components/Navbar';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();

      // 필터가 있는 경우에만 쿼리 파라미터에 추가
      if (filters.actionType) queryParams.append('actionType', filters.actionType);
      if (filters.entityType) queryParams.append('entityType', filters.entityType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.userId) queryParams.append('actorId', filters.userId);

      console.log('검색 파라미터:', queryParams.toString()); // 디버깅용

      const response = await fetch(`https://localhost/api/auditLog/search?${queryParams.toString()}`, {
        headers: {
          'Authorization': token,
          'accept': '*/*'
        },
      });

      if (!response.ok) {
        throw new Error('로그를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('응답 데이터:', data); // 디버깅용
      
      // 응답 데이터에서 logs 배열을 추출
      const logsData = data.logs || [];
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('로그를 불러오는데 실패했습니다.');
      setLogs([]);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getActionTypeColor = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return '#4CAF50';
      case 'UPDATE':
      case 'MODIFY':
        return '#2196F3';
      case 'DELETE':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // 검색 버튼 클릭 시 페이지를 1로 초기화하고 검색
  const handleSearch = () => {
    console.log('현재 필터:', filters); // 디버깅용
    fetchLogs();
  };

  return (
    <PageContainer>
      <Navbar />
      <MainContent>
        <Header>
          <Title>감사 로그</Title>
          <FilterContainer>
            <FilterGroup>
              <Label>액션 타입</Label>
              <Select name="actionType" value={filters.actionType} onChange={handleFilterChange}>
                <option value="">전체</option>
                <option value="CREATE">생성</option>
                <option value="MODIFY">수정</option>
                <option value="DELETE">삭제</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <Label>엔티티 타입</Label>
              <Select name="entityType" value={filters.entityType} onChange={handleFilterChange}>
                <option value="">전체</option>
                <option value="PROJECT">프로젝트</option>
                <option value="USER">사용자</option>
                <option value="POST">게시글</option>
                <option value="COMMENT">댓글</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <Label>시작일</Label>
              <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </FilterGroup>
            <FilterGroup>
              <Label>종료일</Label>
              <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </FilterGroup>
            <FilterGroup>
              <Label>사용자 ID</Label>
              <Input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} placeholder="사용자 ID" />
            </FilterGroup>
            <SearchButton onClick={handleSearch}>검색</SearchButton>
          </FilterContainer>
        </Header>

        {loading ? (
          <Loading>로딩중...</Loading>
        ) : logs.length === 0 ? (
          <Loading>데이터가 없습니다.</Loading>
        ) : (
          <LogTable>
            <thead>
              <tr>
                <th>시간</th>
                <th>사용자 ID</th>
                <th>액션</th>
                <th>대상 타입</th>
                <th>대상 ID</th>
                <th>상세 정보</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <LogRow key={log.id}>
                  <td>{formatDate(log.loggedAt)}</td>
                  <td>{log.actorId}</td>
                  <td>
                    <ActionBadge color={getActionTypeColor(log.actionType)}>
                      {log.actionType}
                    </ActionBadge>
                  </td>
                  <td>{log.targetType}</td>
                  <td>{log.targetId}</td>
                  <td>
                    {log.details && log.details.length > 0 ? (
                      <DetailsButton onClick={() => handleLogClick(log)}>
                        상세보기
                      </DetailsButton>
                    ) : (
                      '-'
                    )}
                  </td>
                </LogRow>
              ))}
            </tbody>
          </LogTable>
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
                      <div>이전 값: {detail.oldValue}</div>
                      <div>새로운 값: {detail.newValue}</div>
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
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px 80px;
  margin-top: 60px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #64748b;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #1e293b;
  }
`;

const LogRow = styled.tr`
  &:hover {
    background-color: #f8fafc;
  }
`;

const ActionBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${props => props.color};
`;

const Loading = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: ${props => props.active ? '#2563eb' : 'white'};
  color: ${props => props.active ? 'white' : '#1e293b'};
  cursor: pointer;

  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#f8fafc'};
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  align-self: flex-end;
  margin-top: 24px;
  height: 36px;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const DetailsButton = styled.button`
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 24px;
  height: 36px;

  &:hover {
    background-color: #1d4ed8;
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
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailField = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #64748b;
`;

export default AuditLog;