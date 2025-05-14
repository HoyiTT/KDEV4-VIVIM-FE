import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
import MainContent from '../components/common/MainContent';
import { ActionBadge } from '../components/common/Badge';
import Pagination from '../components/common/Pagination';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    display: block;
    width: 3px;
    height: 20px;
    background: #2E7D32;
    border-radius: 1.5px;
  }
`;

const InquiryTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'PENDING':
        return 'rgba(245, 158, 11, 0.1)';
      case 'IN_PROGRESS':
        return 'rgba(46, 125, 50, 0.1)';
      case 'COMPLETED':
        return 'rgba(100, 116, 139, 0.1)';
      default:
        return 'rgba(100, 116, 139, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING':
        return '#F59E0B';
      case 'IN_PROGRESS':
        return '#2E7D32';
      case 'COMPLETED':
        return '#64748B';
      default:
        return '#64748B';
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

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const UserInquiryList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInquiries();
  }, [isAuthenticated]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.USER_INQUIRY_LIST, {
        withCredentials: true
      });
      console.log('Fetched inquiries:', response.data);
      setInquiries(response.data);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('문의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    navigate('/user/inquiries/create');
  };

  const handleInquiryClick = (id) => {
    navigate(`/user/inquiries/${id}`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'IN_PROGRESS':
        return '처리중';
      case 'COMPLETED':
        return '완료';
      default:
        return '대기중';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1);
  };

  const getCurrentPageInquiries = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return inquiries.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(inquiries.length / itemsPerPage);

  if (loading) {
    return (
      <MainContent>
        <LoadingMessage>문의 목록을 불러오는 중...</LoadingMessage>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent>
        <LoadingMessage>{error}</LoadingMessage>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <Header>
        <PageTitle>내 문의</PageTitle>
        <ActionBadge 
          type="success" 
          size="large" 
          onClick={handleCreateClick}
        >
          문의 작성
        </ActionBadge>
      </Header>

      <InquiryTable>
        <thead>
          <tr>
            <TableHeaderCell>제목</TableHeaderCell>
            <TableHeaderCell>상태</TableHeaderCell>
            <TableHeaderCell>작성일</TableHeaderCell>
            <TableHeaderCell>작성자</TableHeaderCell>
          </tr>
        </thead>
        <tbody>
          {getCurrentPageInquiries().map((inquiry) => (
            <TableRow 
              key={inquiry.id}
              onClick={() => handleInquiryClick(inquiry.id)}
            >
              <TableCell>{inquiry.title}</TableCell>
              <TableCell>
                <StatusBadge status={inquiry.inquiryStatus}>
                  {getStatusText(inquiry.inquiryStatus)}
                </StatusBadge>
              </TableCell>
              <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
              <TableCell>{inquiry.creatorName}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </InquiryTable>
      {inquiries.length > 0 && (
        <Pagination
          currentPage={currentPage - 1}
          totalElements={inquiries.length}
          pageSize={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page + 1)}
          showFirstLast={true}
          maxPageNumbers={5}
        />
      )}
    </MainContent>
  );
};

export default UserInquiryList; 