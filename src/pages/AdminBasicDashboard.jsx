import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { axiosInstance } from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardContainer = styled.div`
  padding: 24px;
  height: 100vh;
  overflow-y: auto;
  background-color: #f8fafc;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;  
`; 

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #2E7D32;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const LinkButton = styled(Link)`
  display: inline-block;
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 16px;
  
  &:hover {
    background-color: #1b5e20;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
`;

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
  margin-top: 8px;
  margin-bottom: 16px;

  &:hover {
    background-color: ${props => props.color};
    color: white;
  }
`;

const AdminBasicDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalCompanies: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (endpoint, type) => {
    try {
      const { data } = await axiosInstance.get(endpoint);
      switch (type) {
        case 'approvals':
          setStats(prevStats => ({ ...prevStats, pendingApprovals: data.length }));
          break;
        case 'posts':
          // Assuming setPosts is called elsewhere in the code
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      switch (type) {
        case 'approvals':
          setStats(prevStats => ({ ...prevStats, pendingApprovals: 0 }));
          break;
        case 'posts':
          // Assuming setPosts is called elsewhere in the code
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.all([
          fetchData(API_ENDPOINTS.USERS, 'users'),
          fetchData(API_ENDPOINTS.ADMIN_PROJECTS, 'projects'),
          fetchData(API_ENDPOINTS.COMPANIES, 'companies'),
          fetchData(API_ENDPOINTS.APPROVAL.LIST(progressId), 'approvals'),
          fetchData(API_ENDPOINTS.POST.LIST, 'posts')
        ]);

        const ensureArray = x => Array.isArray(x) ? x : [];

        const newStats = {
          totalUsers: ensureArray(results[0].data).length,
          totalProjects: ensureArray(results[1].data).length,
          totalCompanies: ensureArray(results[2].data).length,
          pendingApprovals: ensureArray(results[3].data)
            .filter(a => a?.status === 'PENDING')
            .length
        };

        setStats(newStats);
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: '대기중', color: '#F97316' };  // 주황색
      case 'IN_PROGRESS':
        return { text: '진행중', color: '#3B82F6' };  // 파란색
      case 'COMPLETED':
        return { text: '완료', color: '#22C55E' };  // 초록색
      case 'ON_HOLD':
        return { text: '보류', color: '#EAB308' };  // 노란색
      default:
        return { text: '대기중', color: '#64748B' };  // 슬레이트
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Card>
          <CardTitle>오류 발생</CardTitle>
          <StatLabel>{error}</StatLabel>
          <LinkButton to="/dashboard" onClick={() => window.location.reload()}>
            새로고침
          </LinkButton>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardGrid>
        <Card>
          <CardTitle>사용자 관리</CardTitle>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>전체 사용자 수</StatLabel>
          <StatusBadge color="#2E7D32">활성</StatusBadge>
          <LinkButton to="/user-management">사용자 관리</LinkButton>
        </Card>

        <Card>
          <CardTitle>프로젝트 관리</CardTitle>
          <StatValue>{stats.totalProjects}</StatValue>
          <StatLabel>전체 프로젝트 수</StatLabel>
          <StatusBadge color="#3B82F6">진행중</StatusBadge>
          <LinkButton to="/admin-projects">프로젝트 관리</LinkButton>
        </Card>

        <Card>
          <CardTitle>회사 관리</CardTitle>
          <StatValue>{stats.totalCompanies}</StatValue>
          <StatLabel>전체 회사 수</StatLabel>
          <StatusBadge color="#22C55E">정상</StatusBadge>
          <LinkButton to="/company-management">회사 관리</LinkButton>
        </Card>

        <Card>
          <CardTitle>승인 요청</CardTitle>
          <StatValue>{stats.pendingApprovals}</StatValue>
          <StatLabel>대기 중인 승인 요청</StatLabel>
          <StatusBadge color="#F97316">대기중</StatusBadge>
          <LinkButton to="/approvals">승인 관리</LinkButton>
        </Card>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default AdminBasicDashboard; 