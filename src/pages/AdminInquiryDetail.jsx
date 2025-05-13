import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import MainContent from '../components/common/MainContent';
import { FaTrashAlt } from 'react-icons/fa';
import ConfirmModal from '../components/common/ConfirmModal';

const AdminInquiryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.companyRole !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchInquiryDetail();
    fetchComments();
  }, [id, user, authLoading]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching inquiry detail for ID:', id);
      console.log('API URL:', API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id));
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id), {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Received inquiry data:', data);
      setInquiry(data);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 403) {
        alert('접근 권한이 없습니다.');
        navigate('/admin/inquiries');
      } else {
        alert('문의 내용을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id)}/comment`, {
        withCredentials: true
      });
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleCompleteAnswer = async () => {
    if (!user || user.companyRole !== 'ADMIN') {
      alert('관리자만 답변 완료 처리가 가능합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.patch(`${API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id)}/complete`, {}, {
        withCredentials: true
      });
      alert('답변이 완료 처리되었습니다.');
      fetchInquiryDetail();
    } catch (error) {
      console.error('Error completing answer:', error);
      alert('답변 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    try {
      await axiosInstance.post(`${API_ENDPOINTS.ADMIN_INQUIRY_DETAIL(id)}/comment`, {
        content: answer
      });
      alert('답변이 등록되었습니다.');
      setAnswer('');
      fetchComments();
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('답변 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.patch(API_ENDPOINTS.ADMIN_INQUIRY_DELETE(id));
      alert('문의가 삭제되었습니다.');
      navigate('/admin/inquiries');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('문의 삭제 중 오류가 발생했습니다.');
    }
    setDeleteModalOpen(false);
  };

  const handleDeleteCommentClick = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteCommentModalOpen(true);
  };

  const handleDeleteCommentConfirm = async () => {
    try {
      await axiosInstance.patch(API_ENDPOINTS.ADMIN_INQUIRY_COMMENT_DELETE(id, commentToDelete));
      alert('답변이 삭제되었습니다.');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('답변 삭제 중 오류가 발생했습니다.');
    }
    setDeleteCommentModalOpen(false);
    setCommentToDelete(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <Sidebar />
        <MainContent>
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        </MainContent>
      </PageContainer>
    );
  }

  if (!inquiry) {
    return (
      <PageContainer>
        <Sidebar />
        <MainContent>
          <ErrorMessage>문의를 찾을 수 없습니다.</ErrorMessage>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <Header>
          <BackButton onClick={() => navigate('/admin/inquiries')}>
            <span>←</span>
            목록으로
          </BackButton>
          <PageTitle style={{ margin: '0 0 0 24px' }}>문의사항 상세</PageTitle>
        </Header>
        <ContentContainer>
          <TitleSection>
            <TitleHeader>
              <div>
                <TypeBadge type={inquiry.inquiryType}>
                  {inquiry.inquiryType === 'NORMAL' ? '일반' : '프로젝트'}
                </TypeBadge>
                <StatusBadge status={inquiry.inquiryStatus}>
                  {inquiry.inquiryStatus === 'PENDING' ? '답변 대기' :
                   inquiry.inquiryStatus === 'IN_PROGRESS' ? '처리중' : '답변 완료'}
                </StatusBadge>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {inquiry.inquiryStatus !== 'COMPLETED' && (
                  <CreateButton onClick={handleCompleteAnswer}>
                    답변 완료하기
                  </CreateButton>
                )}
                <CreateButton onClick={handleDeleteClick} style={{ background: '#dc2626' }}>
                  <FaTrashAlt /> 문의사항 삭제
                </CreateButton>
              </div>
            </TitleHeader>
            <Title>{inquiry.title}</Title>
            <InfoSection>
              <InfoItem>
                <InfoLabel>작성자</InfoLabel>
                <InfoValue>{inquiry.creatorName}</InfoValue>
              </InfoItem>
              {inquiry.inquiryType === 'PROJECT' && (
                <InfoItem>
                  <InfoLabel>프로젝트</InfoLabel>
                  <InfoValue>{inquiry.projectName}</InfoValue>
                </InfoItem>
              )}
              <InfoItem>
                <InfoLabel>작성일</InfoLabel>
                <InfoValue>
                  {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\. /g, '.').slice(0, -1)}
                </InfoValue>
              </InfoItem>
            </InfoSection>
          </TitleSection>
          <ContentSection>
            <Content>{inquiry.content}</Content>
          </ContentSection>

          <CommentSection>
            <CommentTitle>답변 목록</CommentTitle>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.id}>
                  <CommentHeader>
                    <CommentInfo>
                      <AdminBadge>관리자</AdminBadge>
                      <CommentDate>
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(/\. /g, '.').slice(0, -1)}
                      </CommentDate>
                    </CommentInfo>
                    <DeleteButton onClick={() => handleDeleteCommentClick(comment.id)}>
                      <FaTrashAlt /> 삭제
                    </DeleteButton>
                  </CommentHeader>
                  <CommentContent>{comment.content}</CommentContent>
                </CommentItem>
              ))
            ) : (
              <EmptyMessage>아직 답변이 없습니다.</EmptyMessage>
            )}
          </CommentSection>

          <AnswerSection>
            <AnswerTitle>답변 작성</AnswerTitle>
            <AnswerInputContainer>
              <AnswerTextArea
                placeholder="답변을 입력해주세요..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={inquiry.inquiryStatus === 'COMPLETED'}
              />
              <SubmitButton 
                onClick={handleSubmitAnswer}
                disabled={inquiry.inquiryStatus === 'COMPLETED' || !answer.trim()}
              >
                등록
              </SubmitButton>
            </AnswerInputContainer>
          </AnswerSection>
        </ContentContainer>

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="문의 삭제"
          message={`정말로 이 문의를 삭제하시겠습니까?
삭제된 문의는 복구할 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          type="delete"
        />

        <ConfirmModal
          isOpen={deleteCommentModalOpen}
          onClose={() => setDeleteCommentModalOpen(false)}
          onConfirm={handleDeleteCommentConfirm}
          title="답변 삭제"
          message={`정말로 이 답변을 삭제하시겠습니까?
삭제된 답변은 복구할 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          type="delete"
        />
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
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 15px;
  cursor: pointer;
  padding: 8px 0;
  
  &:hover {
    color: #2E7D32;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const TitleSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const TitleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: #E0F2FE;
  color: #0369A1;
  margin-right: 8px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#FEF3C7';
      case 'IN_PROGRESS': return '#DBEAFE';
      case 'COMPLETED': return '#DCFCE7';
      default: return '#F8FAFC';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#D97706';
      case 'IN_PROGRESS': return '#2563EB';
      case 'COMPLETED': return '#16A34A';
      default: return '#64748B';
    }
  }};
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const InfoSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
`;

const ContentSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const Content = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
`;

const CommentSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const CommentTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
`;

const CommentItem = styled.div`
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CommentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AdminBadge = styled.span`
  padding: 4px 8px;
  background: #2E7D32;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const CommentDate = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const CommentContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
`;

const AnswerSection = styled.div`
  padding: 24px;
`;

const AnswerTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const AnswerInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const AnswerTextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 16px;
  padding-bottom: 60px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
  }
  
  &:disabled {
    background-color: #f8fafc;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }
  
  &:disabled {
    background: #94A3B8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.background || '#2E7D32'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.background ? '#B91C1C' : '#1B5E20'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
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

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #DC2626;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #64748b;
  font-size: 14px;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default AdminInquiryDetail; 