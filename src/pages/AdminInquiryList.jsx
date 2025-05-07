import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

const AdminInquiryList = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    title: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.companyRole !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchInquiries();
  }, [currentPage, user, authLoading]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_INQUIRY_LIST, {
        withCredentials: true
      });
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_INQUIRY_LIST, {
        withCredentials: true
      });
      setInquiries(data || []);
    } catch (error) {
      console.error('Error searching inquiries:', error);
      setInquiries([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').slice(0, -1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: '대기중', color: '#DC2626' };
      case 'IN_PROGRESS':
        return { text: '처리중', color: '#2E7D32' };
      case 'COMPLETED':
        return { text: '완료', color: '#64748B' };
      default:
        return { text: '대기중', color: '#64748B' };
    }
  };

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <Header>
          <PageTitle>문의사항 관리</PageTitle>
          <SearchSection>
            <SearchInput
              type="text"
              name="title"
              placeholder="제목 검색"
              value={filters.title}
              onChange={handleFilterChange}
            />
            <SearchSelect
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">상태 선택</option>
              <option value="PENDING">대기중</option>
              <option value="IN_PROGRESS">처리중</option>
              <option value="COMPLETED">완료</option>
            </SearchSelect>
            <SearchInput
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
            <SearchInput
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
            <SearchButton onClick={handleSearch}>
              검색
            </SearchButton>
          </SearchSection>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <UsersTable>
              <thead>
                <tr>
                  <TableHeaderCell>제목</TableHeaderCell>
                  <TableHeaderCell>작성자</TableHeaderCell>
                  <TableHeaderCell>작성일</TableHeaderCell>
                  <TableHeaderCell>상태</TableHeaderCell>
                  <TableHeaderCell>액션</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => {
                  const statusBadge = getStatusBadge(inquiry.status);
                  return (
                    <TableRow key={inquiry.id} onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}>
                      <TableCell>{inquiry.title}</TableCell>
                      <TableCell>{inquiry.creatorName}</TableCell>
                      <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge color={statusBadge.color}>
                          {statusBadge.text}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButtonContainer>
                          <ActionButton onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/inquiries/${inquiry.id}`);
                          }}>
                            상세보기
                          </ActionButton>
                        </ActionButtonContainer>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </UsersTable>
          </>
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

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  margin-left: 15px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  gap: 24px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-end;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 240px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &::placeholder {
    color: #94a3b8;
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

const SearchSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 240px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: white;
  
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

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const UsersTable = styled.table`
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
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
  color: ${props => props.color};
  background-color: rgba(241, 245, 249, 0.8);
  border: 1px solid ${props => props.color};

  &:hover {
    background-color: ${props => props.color};
    color: white;
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
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

export default AdminInquiryList; 