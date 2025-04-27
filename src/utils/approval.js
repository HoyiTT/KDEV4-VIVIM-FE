import { ApprovalProposalStatus } from '../constants/enums';

/**
 * 승인 요청의 상태를 한글 텍스트로 변환하는 함수입니다.
 * ApprovalDetail과 ProjectDetail 페이지에서 공통으로 사용합니다.
 * 
 * @param {string} status - 승인 요청의 상태 코드
 * @returns {string} 상태에 해당하는 한글 텍스트
 */
export const getApprovalStatusText = (status) => {
  switch (status) {
    case ApprovalProposalStatus.BEFORE_REQUEST_PROPOSAL:
      return '요청전';
    case ApprovalProposalStatus.WAITING_FOR_DECISIONS:
      return '응답 대기중';
    case ApprovalProposalStatus.REJECTED_BY_ANY_DECISION:
      return '응답 진행중';
    case ApprovalProposalStatus.APPROVED_BY_ALL_DECISIONS:
      return '최종 승인됨';
    case 'APPROVED':
      return '승인됨';
    case 'REJECTED':
      return '반려됨';
    default:
      return status;
  }
};

/**
 * 승인 요청의 상태에 따른 배경색을 반환하는 함수입니다.
 * 
 * @param {string} status - 승인 요청의 상태 코드
 * @returns {string} 상태에 해당하는 배경색 CSS 값
 */
export const getApprovalStatusBackgroundColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case ApprovalProposalStatus.APPROVED_BY_ALL_DECISIONS:
      return '#dcfce7';
    case 'REJECTED':
    case ApprovalProposalStatus.REJECTED_BY_ANY_DECISION:
      return '#fee2e2';
    case ApprovalProposalStatus.BEFORE_REQUEST_PROPOSAL:
      return '#f1f5f9';
    case ApprovalProposalStatus.WAITING_FOR_DECISIONS:
    case 'REQUEST_PROPOSAL':
      return '#dbeafe';
    case ApprovalProposalStatus.IN_PROGRESS_DECISIONS:
      return '#fef9c3';
    default:
      return '#f1f5f9';
  }
};

/**
 * 승인 요청의 상태에 따른 텍스트 색상을 반환하는 함수입니다.
 * 
 * @param {string} status - 승인 요청의 상태 코드
 * @returns {string} 상태에 해당하는 텍스트 색상 CSS 값
 */
export const getApprovalStatusTextColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case ApprovalProposalStatus.APPROVED_BY_ALL_DECISIONS:
      return '#16a34a';
    case 'REJECTED':
    case ApprovalProposalStatus.REJECTED_BY_ANY_DECISION:
      return '#dc2626';
    case ApprovalProposalStatus.BEFORE_REQUEST_PROPOSAL:
      return '#64748b';
    case ApprovalProposalStatus.WAITING_FOR_DECISIONS:
    case 'REQUEST_PROPOSAL':
      return '#2563eb';
    case ApprovalProposalStatus.IN_PROGRESS_DECISIONS:
      return '#ca8a04';
    default:
      return '#64748b';
  }
}; 