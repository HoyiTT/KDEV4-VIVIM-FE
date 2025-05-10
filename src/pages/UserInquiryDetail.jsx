import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
import MainContent from '../components/common/MainContent';

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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const ContentContainer = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const TitleSection = styled.div`
  margin-bottom: 32px;
`;

const TitleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  color: #64748b;
  font-size: 14px;
`;

const Content = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
`;

const AnswerSection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
`;

const AnswerTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const UserInquiryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      fetchInquiryDetail();
    }
  }, [id, authLoading, isAuthenticated]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id), {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Inquiry response:', response.data);
      setInquiry(response.data);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      if (error.response?.status === 403) {
        alert('접근 권한이 없습니다.');
        navigate('/user/inquiries');
      } else {
        alert('문의 내용을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <MainContent>
        <LoadingMessage>문의 내용을 불러오는 중...</LoadingMessage>
      </MainContent>
    );
  }

  if (!inquiry) {
    return (
      <MainContent>
        <LoadingMessage>문의를 찾을 수 없습니다.</LoadingMessage>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <Header>
        <BackButton onClick={() => navigate('/user/inquiries')}>
          <span>←</span>
          목록으로
        </BackButton>
        <PageTitle>문의 상세</PageTitle>
      </Header>

      <ContentContainer>
        <TitleSection>
          <TitleHeader>
            <StatusBadge status={inquiry?.inquiryStatus}>
              {getStatusText(inquiry?.inquiryStatus)}
            </StatusBadge>
          </TitleHeader>
          <Title>{inquiry?.title}</Title>
          <MetaInfo>
            <span>작성자: {inquiry?.creatorName}</span>
            <span>작성일: {formatDate(inquiry?.createdAt)}</span>
            {inquiry?.projectName && <span>프로젝트: {inquiry.projectName}</span>}
          </MetaInfo>
        </TitleSection>

        <Content>{inquiry?.content}</Content>

        {inquiry?.answer && (
          <AnswerSection>
            <AnswerTitle>답변</AnswerTitle>
            <Content>{inquiry.answer}</Content>
            <MetaInfo>
              <span>답변일: {formatDate(inquiry.answeredAt)}</span>
            </MetaInfo>
          </AnswerSection>
        )}
      </ContentContainer>
    </MainContent>
  );
};

export default UserInquiryDetail; 