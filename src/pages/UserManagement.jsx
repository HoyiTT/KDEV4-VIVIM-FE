import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const UserManagement = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, [currentPage]);

  const fetchCompanies = async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.COMPANIES);
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
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

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_SEARCH}?${queryParams}`);
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

      const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_SEARCH}?${queryParams}`);
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

  return (
    <PageContainer>
      <ContentWrapper>
        <Card>
          <CardTitle>사용자 관리</CardTitle>
          <CardContent>
            <UserList>
              {users.map((user) => (
                <UserItem key={user.id}>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserInfo>
                  <UserActions>
                    <EditButton onClick={() => navigate(`/user-edit/${user.id}`)}>
                      수정
                    </EditButton>
                    <DeleteButton onClick={() => handleDeleteUser(user.id, user.name)}>
                      삭제
                    </DeleteButton>
                  </UserActions>
                </UserItem>
              ))}
            </UserList>
          </CardContent>
        </Card>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  flex: 1;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #e8f5e9;
  color: #2E7D32;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #c8e6c9;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fecaca;
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

export default UserManagement;
