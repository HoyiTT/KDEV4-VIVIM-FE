import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const UserManagement = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('사용자 관리');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    companyRole: '',
    isDeleted: false
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, [currentPage]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.COMPANIES, {
        headers: {
          'Authorization': `${localStorage.getItem('token')?.trim()}`
        }
      });
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // 필터가 비어있는 경우 기본 페이지네이션 파라미터만 사용
      const queryParams = new URLSearchParams({
        page: currentPage,
        size: 10
      }).toString();

      const response = await fetch(`${API_ENDPOINTS.USERS_SEARCH}?${queryParams}`, {
        headers: {
          'Authorization': `${localStorage.getItem('token')?.trim()}`
        }
      });
      const data = await response.json();
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    
    // 입력된 값만 필터링
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

    fetch(`${API_ENDPOINTS.USERS_SEARCH}?${queryParams}`, {
      headers: {
        'Authorization': `${localStorage.getItem('token')?.trim()}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setUsers(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(error => {
        console.error('Error searching users:', error);
      });
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
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.USER_DETAIL(userId), {
          method: 'DELETE',
          headers: {
            'Authorization': token
          }
        });

        if (response.ok) {
          alert(`${userName} 유저가 삭제되었습니다.`);
          fetchUsers();
        } else {
          alert('유저 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('유저 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // 회사별 직원 수 계산
  const getCompanyUserDistribution = () => {
    const companyUserCount = {};
    
    users.forEach(user => {
      const companyName = user.companyName || '미지정';
      companyUserCount[companyName] = (companyUserCount[companyName] || 0) + 1;
    });

    return Object.entries(companyUserCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 직원 등록 추이 데이터 (임시)
  const getRegistrationTrend = () => {
    const mockData = [
      { date: '2024-01-01', count: 10 },
      { date: '2024-02-01', count: 15 },
      { date: '2024-03-01', count: 20 },
      { date: '2024-04-01', count: 25 },
      { date: '2024-05-01', count: 30 },
      { date: '2024-06-01', count: 35 },
      { date: '2024-07-01', count: 40 },
      { date: '2024-08-01', count: 45 },
      { date: '2024-09-01', count: 50 },
      { date: '2024-10-01', count: 55 },
      { date: '2024-11-01', count: 60 },
      { date: '2024-12-01', count: 65 }
    ];

    return mockData;
  };

  const COLORS = ['#4F6AFF', '#FF6B6B', '#4CAF50', '#FFC107', '#9C27B0', '#00BCD4'];

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    if (!sortConfig.key) return users;

    return [...users].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'ascending' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'email') {
        return sortConfig.direction === 'ascending'
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      if (sortConfig.key === 'phone') {
        return sortConfig.direction === 'ascending'
          ? a.phone.localeCompare(b.phone)
          : b.phone.localeCompare(a.phone);
      }
      if (sortConfig.key === 'companyName') {
        return sortConfig.direction === 'ascending'
          ? (a.companyName || '').localeCompare(b.companyName || '')
          : (b.companyName || '').localeCompare(a.companyName || '');
      }
      if (sortConfig.key === 'companyRole') {
        const roleOrder = { 'ADMIN': 0, 'DEVELOPER': 1, 'CUSTOMER': 2 };
        return sortConfig.direction === 'ascending'
          ? roleOrder[a.companyRole] - roleOrder[b.companyRole]
          : roleOrder[b.companyRole] - roleOrder[a.companyRole];
      }
      return 0;
    });
  }, [users, sortConfig]);

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

        <ChartsContainer>
          {/* 회사별 직원 수 파이 차트 */}
          <ChartSection>
            <StatisticsTitle>회사별 직원 수</StatisticsTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCompanyUserDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getCompanyUserDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartSection>

          {/* 직원 등록 추이 라인 차트 */}
          <ChartSection>
            <StatisticsTitle>직원 등록 추이</StatisticsTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={getRegistrationTrend()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#4F6AFF"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartSection>
        </ChartsContainer>

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
            <option value="">전체 회사</option>
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
            <option value="">전체</option>
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
            <span>삭제된 유저 포함</span>
          </SearchCheckbox>
          <SearchButton onClick={handleSearch}>
            검색
          </SearchButton>
        </SearchSection>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <UserTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell 
                    onClick={() => handleSort('name')}
                    style={{ cursor: 'pointer' }}
                  >
                    이름 {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHeaderCell>
                  <TableHeaderCell 
                    onClick={() => handleSort('email')}
                    style={{ cursor: 'pointer' }}
                  >
                    이메일 {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHeaderCell>
                  <TableHeaderCell 
                    onClick={() => handleSort('phone')}
                    style={{ cursor: 'pointer' }}
                  >
                    전화번호 {sortConfig.key === 'phone' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHeaderCell>
                  <TableHeaderCell 
                    onClick={() => handleSort('companyName')}
                    style={{ cursor: 'pointer' }}
                  >
                    소속 회사 {sortConfig.key === 'companyName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHeaderCell>
                  <TableHeaderCell 
                    onClick={() => handleSort('companyRole')}
                    style={{ cursor: 'pointer' }}
                  >
                    역할 {sortConfig.key === 'companyRole' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHeaderCell>
                  <TableHeaderCell>관리</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.companyName}</TableCell>
                    <TableCell>
                      {user.companyRole === 'ADMIN' ? '관리자' :
                       user.companyRole === 'DEVELOPER' ? '개발사' :
                       user.companyRole === 'CUSTOMER' ? '고객사' : ''}
                    </TableCell>
                    <TableCell>
                      <ActionButtonContainer>
                        <ActionButton onClick={() => navigate(`/user-edit/${user.id}`)}>수정</ActionButton>
                        <DeleteButton onClick={() => handleDeleteUser(user.id, user.name)}>
                          삭제
                        </DeleteButton>
                      </ActionButtonContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UserTable>
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                이전
              </PageButton>
              <PageInfo>
                {currentPage + 1} / {totalPages}
              </PageInfo>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
              >
                다음
              </PageButton>
            </Pagination>
          </>
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
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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

const UserTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin: 0 auto;
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
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 16px 24px;
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

const SearchSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SearchSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  width: 150px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SearchCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
`;

const StatisticsTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-family: 'SUIT', sans-serif;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 16px;
`;

export default UserManagement;