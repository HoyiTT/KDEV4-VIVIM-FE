import { ApprovalProposalStatus, ApprovalApproverStatus } from '../constants/enums';

/**
 *   요청의 상태를 한글 텍스트로 변환하는 함수입니다.
 * ApprovalDetail과 ProjectDetail 페이지에서 공통으로 사용합니다.
 * 
 * @param {string} status - 승인 요청의 상태 코드
 * @returns {string} 상태에 해당하는 한글 텍스트
 */
export const getApprovalStatusText = (status) => {
  switch (status) {
    case ApprovalProposalStatus.DRAFT:
      return '작성중';
    case ApprovalProposalStatus.UNDER_REVIEW:
      return '검토중';
    case ApprovalProposalStatus.FINAL_APPROVED:
      return '승인완료';
    case ApprovalProposalStatus.FINAL_REJECTED:
      return '반려';
    default:
      return '알 수 없음';
  }
};

/**
 * 승인 요청의 상태에 따른 배경색을 반환하는 함수입니다.
 * 
 * @param {string} status - 승인 요청의 상태 코드
 * @returns {string} 상태에 해당하는 배경색 CSS 값
 */
const getApprovalStatusBackgroundColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case ApprovalProposalStatus.FINAL_APPROVED:
      return '#dcfce7';
    case 'REJECTED':
    case ApprovalProposalStatus.FINAL_REJECTED:
      return '#fee2e2';
    case ApprovalProposalStatus.DRAFT:
      return '#f1f5f9';
    case ApprovalProposalStatus.UNDER_REVIEW:
      return '#dbeafe';
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
const getApprovalStatusTextColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case ApprovalProposalStatus.FINAL_APPROVED:
      return '#16a34a';
    case 'REJECTED':
    case ApprovalProposalStatus.FINAL_REJECTED:
      return '#dc2626';
    case ApprovalProposalStatus.DRAFT:
      return '#64748b';
    case ApprovalProposalStatus.UNDER_REVIEW:
      return '#2563eb';
    default:
      return '#64748b';
  }
};

/**
 * 승인자의 상태를 한글 텍스트로 변환하는 함수입니다.
 * 
 * @param {string} status - 승인자의 상태 코드
 * @returns {string} 상태에 해당하는 한글 텍스트
 */
const getApproverStatusText = (status) => {
  switch (status) {
    case ApprovalApproverStatus.NOT_RESPONDED:
      return '응답 대기중';
    case ApprovalApproverStatus.APPROVER_APPROVED:
      return '승인';
    case ApprovalApproverStatus.APPROVER_REJECTED:
      return '반려';
    default:
      return status;
  }
};

// 모든 함수를 하나의 객체로 묶어서 export
const approvalUtils = {
  getApprovalStatusText,
  getApprovalStatusBackgroundColor,
  getApprovalStatusTextColor,
  getApproverStatusText
};

export default approvalUtils; 