import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';

const AdminInquiry = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('관리자 문의');

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // 더미데이터 수정
  const adminInquiries = [
    {
      id: 1,
      title: "프로젝트 권한 설정 문의",
      author: "김철수",
      company: "테크솔루션",
      date: "2024.03.21",
      status: "미답변",
      content: "프로젝트 관리자 권한 설정 방법을 알고 싶습니다."
    },
    {
      id: 2,
      title: "결제 정보 변경 요청",
      author: "이영희",
      company: "디자인허브",
      date: "2024.03.21",
      status: "답변완료",
      content: "회사 법인카드 정보를 변경하고 싶습니다."
    },
    // ... 더 많은 데이터 추가
  ];

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <Header>
          <PageTitle>관리자 문의</PageTitle>
          <TotalCount>총 {adminInquiries.length}건</TotalCount>
        </Header>
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>회사명</th>
                <th>작성자</th>
                <th>등록일</th>
                <th>상태</th>
              </tr>
            </TableHeader>
            <TableBody>
              {adminInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <td>{inquiry.id}</td>
                  <td>
                    <InquiryTitle>{inquiry.title}</InquiryTitle>
                  </td>
                  <td>{inquiry.company}</td>
                  <td>{inquiry.author}</td>
                  <td>{inquiry.date}</td>
                  <td>
                    <InquiryStatus status={inquiry.status}>
                      {inquiry.status}
                    </InquiryStatus>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.main`
  padding: 24px;
  margin-top: 60px;
  max-width: 2000px;
  margin-left: 300px;
  margin-right: 300px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
`;

const TotalCount = styled.span`
  font-size: 16px;
  color: #64748b;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 100%;
  margin: 0 auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  
  th {
    padding: 16px;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const TableBody = styled.tbody`
  tr:hover {
    background: #f8fafc;
  }
`;

const TableRow = styled.tr`
  td {
    padding: 16px;
    font-size: 14px;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const InquiryTitle = styled.span`
  color: #1e293b;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
  }
`;

const InquiryStatus = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  ${props => {
    switch (props.status) {
      case '미답변':
        return `
          background-color: #FEF2F2;
          color: #EF4444;
        `;
      case '답변완료':
        return `
          background-color: #F0FDF4;
          color: #22C55E;
        `;
      case '검토중':
        return `
          background-color: #F0F9FF;
          color: #0EA5E9;
        `;
      default:
        return `
          background-color: #F8FAFC;
          color: #64748B;
        `;
    }
  }}
`;

export default AdminInquiry; 