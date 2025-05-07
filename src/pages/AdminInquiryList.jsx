import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

const AdminInquiryList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const isAdmin = user?.companyRole === 'ADMIN';
  const [activeMenuItem, setActiveMenuItem] = useState(isAdmin ? '관리자 문의' : '내 문의 내역');
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    title: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1);
  };

  const fetchInquiries = async () => {
    try {
      const { data } = await axiosInstance.get(
        isAdmin ? API_ENDPOINTS.ADMIN_INQUIRY_LIST : API_ENDPOINTS.USER_INQUIRY_LIST,
        { withCredentials: true }
      );
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInquiries(sortedData);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    }
  };

  // 문의 내역 조회
  useEffect(() => {
    fetchInquiries();
  }, [isAdmin]);

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;

    try {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id), { withCredentials: true });
      alert('삭제되었습니다.');
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Card>
          <CardTitle>문의사항 관리</CardTitle>
          <CardContent>
            <InquiryList>
              {inquiries.map((inquiry) => (
                <InquiryItem key={inquiry.id}>
                  <InquiryInfo>
                    <InquiryTitle>{inquiry.title}</InquiryTitle>
                    <InquiryStatus status={inquiry.status}>
                      {inquiry.status}
                    </InquiryStatus>
                  </InquiryInfo>
                  <InquiryDate>{formatDate(inquiry.createdAt)}</InquiryDate>
                </InquiryItem>
              ))}
            </InquiryList>
          </CardContent>
        </Card>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  flex: 1;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InquiryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const InquiryInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const InquiryTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
`;

const InquiryStatus = styled.div`
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#fff7ed';
      case 'IN_PROGRESS': return '#e8f5e9';
      case 'COMPLETED': return '#f1f5f9';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#c2410c';
      case 'IN_PROGRESS': return '#2E7D32';
      case 'COMPLETED': return '#64748b';
      default: return '#64748b';
    }
  }};
`;

const InquiryDate = styled.div`
  font-size: 13px;
  color: #94a3b8;
`;

export default AdminInquiryList; 