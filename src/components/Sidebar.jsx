import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const Sidebar = ({ isAdmin, currentProjectId }) => {  // Add currentProjectId prop
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [isAdmin]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      
      console.log('Sidebar isAdmin value:', isAdmin);  // Add this
      
      if (isAdmin) {
        endpoint = API_ENDPOINTS.ADMIN_PROJECTS;
        console.log('Using admin endpoint');  // Add this
      } else {
        console.log('Using user endpoint');  // Add this
        // Get current user ID from token instead of localStorage
        const userId = localStorage.getItem('userId');
        
        // Add debugging
        console.log('User ID from localStorage:', userId);
        
        if (!userId) {
          // Try to get userId from token if not in localStorage
          try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const tokenUserId = decodedToken.userId;
            console.log('User ID from token:', tokenUserId);
            
            if (tokenUserId) {
              endpoint = API_ENDPOINTS.USER_PROJECTS(tokenUserId);
            } else {
              console.error('User ID not found in token');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            setLoading(false);
            return;
          }
        } else {
          endpoint = API_ENDPOINTS.USER_PROJECTS(userId);
        }
      }
      
      console.log('Fetching projects from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Projects data:', data);
        setProjects(data);
      } else {
        console.error('Failed to fetch projects:', response.status);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>{isAdmin ? '전체 프로젝트' : '내 프로젝트'}</SidebarTitle>
      </SidebarHeader>
      
      {loading ? (
        <LoadingText>로딩 중...</LoadingText>
      ) : (
        <ProjectList>
          {projects.length > 0 ? (
            projects.map(project => (
              <ProjectItem 
                key={project.projectId} 
                onClick={() => navigate(`/project/${project.projectId}`)}
                isActive={project.projectId === Number(currentProjectId)}
              >
                <ProjectName>{project.name}</ProjectName>
                <ProjectStatus deleted={project.deleted}>
                  {project.deleted ? '삭제됨' : '진행중'}
                </ProjectStatus>
              </ProjectItem>
            ))
          ) : (
            <EmptyMessage>
              {isAdmin ? '등록된 프로젝트가 없습니다.' : '참여 중인 프로젝트가 없습니다.'}
            </EmptyMessage>
          )}
        </ProjectList>
      )}
      
      {isAdmin && (
        <AddProjectButton onClick={() => navigate('/projectCreate')}>
          + 새 프로젝트 추가
        </AddProjectButton>
      )}
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 250px;
  height: calc(100vh - 60px);
  background-color: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 60px;
  left: 0;
`;

const SidebarHeader = styled.div`
  padding: 20px 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const SidebarTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProjectItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  background-color: ${props => props.isActive ? '#f1f5f9' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? '#f1f5f9' : '#f8fafc'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProjectName = styled.div`
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`;

const ProjectStatus = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  
  ${props => props.deleted ? `
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  ` : `
    background: rgba(46, 125, 50, 0.1);
    color: #2E7D32;
  `}
`;

const LoadingText = styled.div`
  padding: 20px 16px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
`;

const EmptyMessage = styled.div`
  padding: 20px 16px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
`;

const AddProjectButton = styled.button`
  margin: 16px;
  padding: 10px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1B5E20;
  }
`;

export default Sidebar;