import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserManagement = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('사용자 관리');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://dev.vivim.co.kr/api/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`정말로 ${userName} 유저를 삭제하시겠습니까?`)) {
      try {
        const response = await fetch(`https://dev.vivim.co.kr/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert(`${userName} 유저가 삭제되었습니다.`);
          fetchUsers(); // 유저 목록 새로고침
        } else {
          alert('유저 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('유저 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem} 
        handleMenuClick={handleMenuClick} 
      />

      <MainContent>
        <Header>
          <PageTitle>유저 관리</PageTitle>
          <AddButton onClick={() => navigate('/user-create')}>
            새 유저 등록
          </AddButton>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <UserTable>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>이름</TableHeaderCell>
                <TableHeaderCell>이메일</TableHeaderCell>
                <TableHeaderCell>소속 회사</TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.companyName ? (
                      <CompanyBadge>{user.companyName}</CompanyBadge>
                    ) : (
                      <NoCompanyBadge>미소속</NoCompanyBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ActionButtonContainer>
                      <ActionButton>상세보기</ActionButton>
                      <DeleteButton onClick={() => handleDeleteUser(user.id, user.name)}>
                        삭제
                      </DeleteButton>
                    </ActionButtonContainer>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UserTable>
        )}
      </MainContent>
    </PageContainer>
  );
};

// DashboardContainer를 PageContainer로 변경하고 flex-direction을 column으로 설정
// 스타일 컴포넌트들을 상단으로 이동
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-top: 60px;
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

const UserTable = styled.table`
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

const CompanyBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  background: rgba(46, 125, 50, 0.1);
  color: #2E7D32;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const NoCompanyBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
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

export default UserManagement;