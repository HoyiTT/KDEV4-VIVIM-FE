import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
// Sidebar 대신 Navbar 컴포넌트 import
import Navbar from '../components/Navbar';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('회사 관리');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 회사 삭제 함수 추가
  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('정말로 이 회사를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/companies/${companyId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // 삭제 성공 시 목록 다시 불러오기
          fetchCompanies();
        } else {
          alert('회사 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('회사 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/companies');
      const data = await response.json();
      setCompanies(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setLoading(false);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <Header>
          <PageTitle>회사 관리</PageTitle>
          <AddButton onClick={() => navigate('/company-create')}>
            새 회사 등록
          </AddButton>
        </Header>

        {/* 기존 컨텐츠 유지 */}
        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <CompanyTable>
            <thead>
              <tr>
                <TableHeaderCell>회사명</TableHeaderCell>
                <TableHeaderCell>사업자등록번호</TableHeaderCell>
                <TableHeaderCell>대표자</TableHeaderCell>
                <TableHeaderCell>연락처</TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell 
                    onClick={() => navigate(`/company/${company.id}`)}
                    style={{ cursor: 'pointer', color: '#2E7D32' }}
                  >
                    {company.name}
                  </TableCell>
                  <TableCell>{company.businessNumber}</TableCell>
                  <TableCell>{company.representative}</TableCell>
                  <TableCell>{company.phoneNumber}</TableCell>
                  <TableCell>
                    <ActionButtonContainer>
                      <ActionButton onClick={() => navigate(`/company-edit/${company.companyId}`)}>
                        수정
                      </ActionButton>
                      <DeleteButton onClick={() => handleDeleteCompany(company.id)}>
                        삭제
                      </DeleteButton>
                    </ActionButtonContainer>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </CompanyTable>
        )}
      </MainContent>
    </PageContainer>
  );
};

// DashboardContainer를 PageContainer로 변경하고 flex-direction을 column으로 설정
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

// MainContent 스타일 수정
const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px; // 네비게이션바 높이만큼 여백 추가
`;

// 기존 스타일 컴포넌트 유지
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
  margin: 0;
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1B5E20;
  }
`;

const CompanyTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

// 기타 필요한 스타일 컴포넌트들...

export default CompanyManagement;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #4F6AFF;
  border: 1px solid #4F6AFF;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(79, 106, 255, 0.1);
  }
`;