import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('회사 관리');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

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
    <DashboardContainer>
      <Sidebar 
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

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <CompanyTable>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>회사명</TableHeaderCell>
                <TableHeaderCell>사업자 번호</TableHeaderCell>
                <TableHeaderCell>주소</TableHeaderCell>
                <TableHeaderCell>회사 유형</TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.businessNumber}</TableCell>
                  <TableCell>{company.address}</TableCell>
                  <TableCell>
                    <RoleBadge role={company.companyRole}>
                      {company.companyRole}
                    </RoleBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButton>상세보기</ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </CompanyTable>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  
  ${props => {
    switch (props.role) {
      case 'ADMIN':
        return `
          background: rgba(46, 125, 50, 0.1);
          color: #2E7D32;
        `;
      case 'DEVELOPER':
        return `
          background: rgba(79, 106, 255, 0.1);
          color: #4F6AFF;
        `;
      case 'CUSTOMER':
        return `
          background: rgba(255, 159, 28, 0.1);
          color: #FF9F1C;
        `;
      default:
        return `
          background: rgba(100, 116, 139, 0.1);
          color: #64748b;
        `;
    }
  }}
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

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

export default CompanyManagement;