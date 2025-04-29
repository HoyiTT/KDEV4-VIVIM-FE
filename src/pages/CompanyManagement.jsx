import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('회사 관리');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    businessNumber: '',
    email: '',
    isDeleted: false
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  useEffect(() => {
    fetchCompanies();
  }, [currentPage]);

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
      setLoading(true);
      
      // 필터가 비어있는 경우 기본 페이지네이션 파라미터만 사용
      const queryParams = new URLSearchParams({
        page: currentPage,
        size: 10
      }).toString();

      const response = await fetch(`${API_ENDPOINTS.COMPANIES_SEARCH}?${queryParams}`, {
        headers: {
          'Authorization': `${localStorage.getItem('token')?.trim()}`
        }
      });
      const data = await response.json();
      setCompanies(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
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

    fetch(`${API_ENDPOINTS.COMPANIES_SEARCH}?${queryParams}`, {
      headers: {
        'Authorization': `${localStorage.getItem('token')?.trim()}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setCompanies(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(error => {
        console.error('Error searching companies:', error);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // 회사 역할별 통계 계산
  const getRoleDistribution = () => {
    const roleCount = {
      'ADMIN': 0,
      'DEVELOPER': 0,
      'CUSTOMER': 0
    };

    companies.forEach(company => {
      roleCount[company.companyRole] = (roleCount[company.companyRole] || 0) + 1;
    });

    return Object.entries(roleCount).map(([name, value]) => ({
      name: name === 'ADMIN' ? '관리자' : 
            name === 'DEVELOPER' ? '개발사' : 
            name === 'CUSTOMER' ? '고객사' : name,
      value
    }));
  };

  // 회사 등록 추이 데이터 계산
  const getRegistrationTrend = () => {
    // 임시 데이터
    const mockData = [
      { date: '2024-01-01', count: 5 },
      { date: '2024-02-01', count: 8 },
      { date: '2024-03-01', count: 12 },
      { date: '2024-04-01', count: 15 },
      { date: '2024-05-01', count: 20 },
      { date: '2024-06-01', count: 25 },
      { date: '2024-07-01', count: 30 },
      { date: '2024-08-01', count: 35 },
      { date: '2024-09-01', count: 40 },
      { date: '2024-10-01', count: 45 },
      { date: '2024-11-01', count: 50 },
      { date: '2024-12-01', count: 55 }
    ];

    return mockData;
  };

  const COLORS = ['#4F6AFF', '#FF6B6B', '#4CAF50'];

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedCompanies = React.useMemo(() => {
    if (!sortConfig.key) return companies;

    return [...companies].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'ascending' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'businessNumber') {
        return sortConfig.direction === 'ascending'
          ? a.businessNumber.localeCompare(b.businessNumber)
          : b.businessNumber.localeCompare(a.businessNumber);
      }
      if (sortConfig.key === 'coOwner') {
        return sortConfig.direction === 'ascending'
          ? a.coOwner.localeCompare(b.coOwner)
          : b.coOwner.localeCompare(a.coOwner);
      }
      if (sortConfig.key === 'phone') {
        return sortConfig.direction === 'ascending'
          ? a.phone.localeCompare(b.phone)
          : b.phone.localeCompare(a.phone);
      }
      if (sortConfig.key === 'companyRole') {
        const roleOrder = { 'ADMIN': 0, 'DEVELOPER': 1, 'CUSTOMER': 2 };
        return sortConfig.direction === 'ascending'
          ? roleOrder[a.companyRole] - roleOrder[b.companyRole]
          : roleOrder[b.companyRole] - roleOrder[a.companyRole];
      }
      return 0;
    });
  }, [companies, sortConfig]);

  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'DEVELOPER':
        return '개발사';
      case 'CUSTOMER':
        return '고객사';
      default:
        return role;
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
          <PageTitle>회사 관리</PageTitle>
          <AddButton onClick={() => navigate('/company-create')}>
            새 회사 등록
          </AddButton>
        </Header>

        <ChartsContainer>
          {/* 회사 역할 분포 파이 차트 */}
          <ChartSection>
            <StatisticsTitle>회사 역할 분포</StatisticsTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getRoleDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getRoleDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartSection>

          {/* 회사 등록 추이 라인 차트 */}
          <ChartSection>
            <StatisticsTitle>회사 등록 추이</StatisticsTitle>
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
            placeholder="회사명 검색"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <SearchInput
            type="text"
            name="businessNumber"
            placeholder="사업자등록번호 검색"
            value={filters.businessNumber}
            onChange={handleFilterChange}
          />
          <SearchInput
            type="text"
            name="email"
            placeholder="이메일 검색"
            value={filters.email}
            onChange={handleFilterChange}
          />
          <SearchCheckbox>
            <input
              type="checkbox"
              name="isDeleted"
              checked={filters.isDeleted}
              onChange={handleFilterChange}
            />
            <span>삭제된 회사 포함</span>
          </SearchCheckbox>
          <SearchButton onClick={handleSearch}>
            검색
          </SearchButton>
        </SearchSection>

        {/* 기존 테이블 섹션 */}
        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <CompanyTable>
            <thead>
              <tr>
                <TableHeaderCell 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  회사명 {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell 
                  onClick={() => handleSort('businessNumber')}
                  style={{ cursor: 'pointer' }}
                >
                  사업자등록번호 {sortConfig.key === 'businessNumber' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell 
                  onClick={() => handleSort('coOwner')}
                  style={{ cursor: 'pointer' }}
                >
                  대표자 {sortConfig.key === 'coOwner' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell 
                  onClick={() => handleSort('phone')}
                  style={{ cursor: 'pointer' }}
                >
                  연락처 {sortConfig.key === 'phone' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell 
                  onClick={() => handleSort('companyRole')}
                  style={{ cursor: 'pointer' }}
                >
                  역할 {sortConfig.key === 'companyRole' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </TableHeaderCell>
                <TableHeaderCell>관리</TableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {sortedCompanies.map((company) => (
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
                    <RoleBadge role={company.companyRole}>
                      {getRoleName(company.companyRole)}
                    </RoleBadge>
                  </TableCell>
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

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.role) {
      case 'ADMIN':
        return 'rgba(79, 106, 255, 0.1)';
      case 'DEVELOPER':
        return 'rgba(255, 107, 107, 0.1)';
      case 'CUSTOMER':
        return 'rgba(76, 175, 80, 0.1)';
      default:
        return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'ADMIN':
        return '#4F6AFF';
      case 'DEVELOPER':
        return '#FF6B6B';
      case 'CUSTOMER':
        return '#4CAF50';
      default:
        return '#64748b';
    }
  }};
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