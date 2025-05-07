import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { API_ENDPOINTS } from '../config/api';

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
  color: ${props => props.color};
  background-color: rgba(241, 245, 249, 0.8);
  border: 1px solid ${props => props.color};

  &:hover {
    background-color: ${props => props.color};
    color: white;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
`;

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    companyRole: '',
    isDeleted: false
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.companyRole !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchCompanies();
    fetchUsers();
  }, [currentPage, user, authLoading]);

  const fetchCompanies = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.COMPANIES, {
        withCredentials: true
      });
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage - 1,
        size: 10
      }).toString();

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_SEARCH}?${queryParams}`, {
        withCredentials: true
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setCurrentPage(1);
      
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== false) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const queryParams = new URLSearchParams({
        ...activeFilters,
        page: 0,
        size: 10
      }).toString();

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_SEARCH}?${queryParams}`, {
        withCredentials: true
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
      setTotalPages(0);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`정말로 ${userName} 유저를 삭제하시겠습니까?`)) {
      try {
        await axiosInstance.delete(API_ENDPOINTS.USER_DETAIL(userId), {
          withCredentials: true
        });
          alert(`${userName} 유저가 삭제되었습니다.`);
          fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('유저 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { text: '관리자', color: '#0F172A' };  // 진한 슬레이트
      case 'DEVELOPER':
        return { text: '개발사', color: '#16A34A' };  // 에메랄드
      case 'CUSTOMER':
        return { text: '고객사', color: '#7C3AED' };  // 바이올렛
      default:
        return { text: '일반', color: '#64748B' };  // 슬레이트
    }
  };

  const TableHeaderCell = styled.th`
    padding: 16px 24px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  `;

  const TableRow = styled.tr`
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f8fafc;
    }
  `;

  const ActionButtonContainer = styled.div`
    display: flex;
    gap: 8px;
  `;

  const ActionButton = styled.button`
    padding: 8px 16px;
    background: #2E7D32;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #1B5E20;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
    }

    &:active {
      transform: translateY(0);
    }
  `;

  const DeleteButton = styled.button`
    padding: 8px 16px;
    background: #EF4444;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #C51111;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
    }

    &:active {
      transform: translateY(0);
    }

    ${props => props.disabled && `
      background: #e2e8f0;
      cursor: not-allowed;
      &:hover {
        transform: none;
        box-shadow: none;
      }
    `}
  `;

  const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
  `;

  const PaginationButton = styled.button`
    padding: 8px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #1e293b;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #f8fafc;
    }

    &:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
    }
  `;

  const PaginationNumber = styled.button`
    width: 32px;
    height: 32px;
  display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.active ? '#2E7D32' : 'white'};
    border: 1px solid ${props => props.active ? '#2E7D32' : '#e2e8f0'};
    border-radius: 6px;
    color: ${props => props.active ? 'white' : '#1e293b'};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: ${props => props.active ? '#2E7D32' : '#f8fafc'};
    }
  `;

  const SearchCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
  `;

  const SearchSection = styled.div`
  display: flex;
  gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    flex: 1;
    justify-content: flex-end;
  `;

  const SearchInput = styled.input`
    padding: 10px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    width: 240px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &::placeholder {
      color: #94a3b8;
    }

  &:hover {
    border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    &:focus {
      outline: none;
      border-color: #2E7D32;
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
    }
  `;

  const SearchSelect = styled.select`
    padding: 10px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    width: 240px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    background-color: white;
    
    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    &:focus {
      outline: none;
      border-color: #2E7D32;
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
    }
  `;

  const SearchCheckbox = styled.label`
  display: flex;
    align-items: center;
  gap: 8px;
  font-size: 14px;
    color: #475569;
  cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s;

  &:hover {
      background: #f8fafc;
    }
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: #2E7D32;
    }
  `;

  const SearchButton = styled.button`
    padding: 10px 20px;
    background: #2E7D32;
    color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);

  &:hover {
      background: #1B5E20;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
    }
  `;

  const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  margin-bottom: 24px;
  background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    gap: 24px;
  `;

  const PageTitle = styled.h1`
    font-size: 20px;
  font-weight: 600;
  color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
    letter-spacing: -0.01em;

    &::before {
      content: '';
      display: block;
      width: 3px;
      height: 20px;
      background: #2E7D32;
      border-radius: 1.5px;
    }
  `;

  const CreateButton = styled.button`
    padding: 10px 20px;
    background: #2E7D32;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;

    &:hover {
      background: #1B5E20;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
    }

    &:active {
      transform: translateY(0);
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

  const UsersTable = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-top: 24px;
  `;

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <Header>
          <PageTitle>사용자 관리</PageTitle>
          <SearchSection>
            <SearchInput
              type="text"
              name="name"
              placeholder="이름 검색"
              value={filters.name}
              onChange={handleFilterChange}
            />
            <SearchInput
              type="text"
              name="email"
              placeholder="이메일 검색"
              value={filters.email}
              onChange={handleFilterChange}
            />
            <SearchInput
              type="text"
              name="phone"
              placeholder="전화번호 검색"
              value={filters.phone}
              onChange={handleFilterChange}
            />
            <SearchSelect
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
            >
              <option value="">회사 선택</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </SearchSelect>
            <SearchSelect
              name="companyRole"
              value={filters.companyRole}
              onChange={handleFilterChange}
            >
              <option value="">역할 선택</option>
              <option value="ADMIN">관리자</option>
              <option value="DEVELOPER">개발사</option>
              <option value="CUSTOMER">고객사</option>
            </SearchSelect>
            <SearchCheckbox>
              <input
                type="checkbox"
                name="isDeleted"
                checked={filters.isDeleted}
                onChange={handleFilterChange}
              />
              <span>삭제된 사용자만 검색</span>
            </SearchCheckbox>
            <SearchButton onClick={handleSearch}>
              검색
            </SearchButton>
          </SearchSection>
          <CreateButton onClick={() => navigate('/user-create')}>
            + 새 사용자 등록
          </CreateButton>
        </Header>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <UsersTable>
              <thead>
                <tr>
                  <TableHeaderCell>이름</TableHeaderCell>
                  <TableHeaderCell>이메일</TableHeaderCell>
                  <TableHeaderCell>전화번호</TableHeaderCell>
                  <TableHeaderCell>소속 회사</TableHeaderCell>
                  <TableHeaderCell>역할</TableHeaderCell>
                  <TableHeaderCell>액션</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.companyRole);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.companyName}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          color={roleBadge.color}
                        >
                          {roleBadge.text}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        {!user.isDeleted && (
                          <ActionButtonContainer>
                            <ActionButton onClick={() => navigate(`/user-edit/${user.id}`)}>
                              수정
                            </ActionButton>
                            <DeleteButton 
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={user.isDeleted}
                            >
                              삭제
                            </DeleteButton>
                          </ActionButtonContainer>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </UsersTable>
            {users.length > 0 && (
              <PaginationContainer>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </PaginationButton>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationNumber
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationNumber>
                ))}
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        )}
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

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  margin-left: 15px;
  overflow-y: auto;
`;

export default UserManagement;
