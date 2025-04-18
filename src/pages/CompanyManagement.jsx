import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';

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
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.COMPANY_DETAIL(companyId), {
          method: 'DELETE',
          headers: {
            'Authorization': token
          }
        });
        
        if (response.ok) {
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
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.COMPANIES, {
        headers: {
          'Authorization': token
        }
      });
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
                    onClick={() => navigate(`/company-edit/${company.id}`)}
                    style={{ cursor: 'pointer', color: '#1e293b' }}
                  >
                    {company.name}
                  </TableCell>
                  <TableCell>{company.businessNumber}</TableCell>
                  <TableCell>{company.coOwner}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>
                    <ActionButtonContainer>
                      <ActionButton onClick={() => navigate(`/company-edit/${company.id}`)}>
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
  font-family: 'SUIT', sans-serif;
`;

// MainContent 스타일 수정
const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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
  font-family: 'SUIT', sans-serif;
`;

const AddButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  
  &:before {
    content: '+';
    font-size: 20px;
    font-weight: 400;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
    background: #2563eb;
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
  margin: 0 auto;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
  font-family: 'SUIT', sans-serif;
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
  font-family: 'SUIT', sans-serif;

  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'SUIT', sans-serif;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'SUIT', sans-serif;
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
  font-family: 'SUIT', sans-serif;

  &:hover {
    background: rgba(79, 106, 255, 0.1);
  }
`;