import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../config/api';
import Navbar from '../components/Navbar';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page,
        ...filters,
      });

      const response = await fetch(`${API_ENDPOINTS.AUDIT_LOGS}?${queryParams}`, {
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('로그를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('로그를 불러오는데 실패했습니다.');
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
    setPage(1); // 필터 변경 시 첫 페이지로 리셋
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getActionTypeColor = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return '#4CAF50';
      case 'UPDATE':
        return '#2196F3';
      case 'DELETE':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
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
                <option value="UPDATE">수정</option>
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
          </FilterContainer>
        </Header>

        {loading ? (
          <Loading>로딩중...</Loading>
        ) : (
          <LogTable>
            <thead>
              <tr>
                <th>시간</th>
                <th>사용자</th>
                <th>액션</th>
                <th>엔티티</th>
                <th>상세 정보</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <LogRow key={log.id}>
                  <td>{formatDate(log.createdAt)}</td>
                  <td>{log.userName || log.userId}</td>
                  <td>
                    <ActionBadge color={getActionTypeColor(log.actionType)}>
                      {log.actionType}
                    </ActionBadge>
                  </td>
                  <td>{log.entityType}</td>
                  <td>{log.details}</td>
                </LogRow>
              ))}
            </tbody>
          </LogTable>
        )}

        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <PageButton
              key={pageNum}
              active={page === pageNum}
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </PageButton>
          ))}
        </Pagination>
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
  padding: 24px;
  margin-top: 60px;
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

export default AuditLog; 