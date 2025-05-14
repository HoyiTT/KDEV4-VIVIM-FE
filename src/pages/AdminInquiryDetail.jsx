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
import { ActionBadge } from '../components/common/Badge';

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
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    

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

  const handleCompleteClick = () => {
    setCompleteModalOpen(true);
  };

  const handleCompleteConfirm = async () => {
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
      setCompleteModalOpen(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (answer.length === 0) {
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
                {inquiry.inquiryStatus !== 'COMPLETED' && comments.length > 0 && (
                  <ActionBadge 
                    type="success" 
                    size="large" 
                    onClick={handleCompleteClick}
                  >
                    답변 완료하기
                  </ActionBadge>
                )}
                <ActionBadge 
                  type="danger" 
                  size="large" 
                  onClick={handleDeleteClick}
                >
                  <FaTrashAlt /> 문의사항 삭제
                </ActionBadge>
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
                      <ActionBadge 
                        type="success" 
                        size="small"
                      >
                        관리자
                      </ActionBadge>
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
                    <ActionBadge 
                      type="danger" 
                      size="medium" 
                      onClick={() => handleDeleteCommentClick(comment.id)}
                    >
                      <FaTrashAlt /> 삭제
                    </ActionBadge>
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
                placeholder="답변을 입력해주세요... (최대 1000자)"
                value={answer}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setAnswer(e.target.value);
                  }
                }}
                disabled={inquiry.inquiryStatus === 'COMPLETED'}
                maxLength={1000}
              />
              {inquiry.inquiryStatus !== 'COMPLETED' && answer.length > 0 && (
                <ButtonContainer>
                  <CharCount $isMaxLength={answer.length >= 1000}>
                    {answer.length}/1000
                  </CharCount>
                  <ActionBadge 
                    type="primary" 
                    size="large" 
                    onClick={handleSubmitAnswer}
                  >
                    등록
                  </ActionBadge>
                </ButtonContainer>
              )}
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

        <ConfirmModal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          onConfirm={handleCompleteConfirm}
          title="답변 완료"
          message="이 문의사항의 답변을 완료 처리하시겠습니까?
완료 처리된 문의사항은 더 이상 답변을 추가할 수 없습니다."
          confirmText="완료"
          cancelText="취소"
          type="success"
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
  background-color: #f1f5f9;
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
  margin-bottom: 16px;
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

  &::placeholder {
    color: #94A3B8;
  }
`;

const CharCount = styled.div`
  font-size: 13px;
  color: ${props => props.$isMaxLength ? '#DC2626' : '#64748B'};
  margin-right: 16px;
  display: flex;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
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

export default AdminInquiryDetail; 