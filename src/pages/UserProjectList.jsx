import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';

const UserProjectList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState('프로젝트 관리');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get(
        API_ENDPOINTS.USER_PROJECTS(user.id),
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const getRoleBadgeText = (role) => {
    switch (role) {
      case 'CLIENT_USER':
        return '고객사(일반)';
      case 'CLIENT_MANAGER':
        return '고객사(담당자)';
      case 'DEVELOPER_USER':
        return '개발자(일반)';
      case 'DEVELOPER_MANAGER':
        return '개발자(담당자)';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Navbar activeMenuItem={activeMenuItem} handleMenuClick={handleMenuClick} />
        <MainContent>
          <LoadingMessage>프로젝트 목록을 불러오는 중...</LoadingMessage>
        </MainContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Navbar activeMenuItem={activeMenuItem} handleMenuClick={handleMenuClick} />
        <MainContent>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={fetchProjects}>다시 시도</RetryButton>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Navbar activeMenuItem={activeMenuItem} handleMenuClick={handleMenuClick} />
      <MainContent>
        <Header>
          <PageTitle>프로젝트 목록</PageTitle>
        </Header>
        <ProjectGrid>
          {projects.map((project) => (
            <ProjectCard key={project.id} onClick={() => navigate(`/project/${project.id}`)}>
              <ProjectTitle>{project.title}</ProjectTitle>
              <ProjectInfo>
                <InfoLabel>상태:</InfoLabel>
                <StatusBadge status={project.status}>
                  {project.status === 'IN_PROGRESS' ? '진행중' :
                   project.status === 'COMPLETED' ? '완료' : '대기중'}
                </StatusBadge>
              </ProjectInfo>
              <ProjectInfo>
                <InfoLabel>역할:</InfoLabel>
                <RoleBadge>{getRoleBadgeText(project.role)}</RoleBadge>
              </ProjectInfo>
              <ProjectInfo>
                <InfoLabel>시작일:</InfoLabel>
                <InfoValue>
                  {new Date(project.startDate).toLocaleDateString('ko-KR')}
                </InfoValue>
              </ProjectInfo>
              <ProjectInfo>
                <InfoLabel>종료일:</InfoLabel>
                <InfoValue>
                  {new Date(project.endDate).toLocaleDateString('ko-KR')}
                </InfoValue>
              </ProjectInfo>
            </ProjectCard>
          ))}
        </ProjectGrid>
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

const Header = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const ProjectCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const ProjectInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  width: 60px;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #1e293b;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#FEF3C7';
      case 'IN_PROGRESS': return '#DBEAFE';
      case 'COMPLETED': return '#DCFCE7';
      case 'ON_HOLD': return '#FEE2E2';
      default: return '#F8FAFC';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#D97706';
      case 'IN_PROGRESS': return '#2563EB';
      case 'COMPLETED': return '#16A34A';
      case 'ON_HOLD': return '#DC2626';
      default: return '#64748B';
    }
  }};

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    margin-right: 6px;
    background: currentColor;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #F5F3FF;
  color: #7C3AED;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ef4444;
  font-size: 16px;
`;

const RetryButton = styled.button`
  display: block;
  margin: 16px auto;
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1b5e20;
  }
`;

export default UserProjectList;