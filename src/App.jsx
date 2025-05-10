import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import MainContent from './components/common/MainContent';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/DashboardAdmin';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectCreate from './pages/ProjectCreate';
import ProjectEdit from './pages/ProjectEdit';
import UserInquiryList from './pages/UserInquiryList';
import UserInquiryCreate from './pages/UserInquiryCreate';
import UserInquiryDetail from './pages/UserInquiryDetail';
import AdminInquiryList from './pages/AdminInquiryList';
import AdminInquiryDetail from './pages/AdminInquiryDetail';
import UserManagement from './pages/UserManagement';
import UserEdit from './pages/UserEdit';
import UserCreate from './pages/UserCreate';
import ProjectManagement from './pages/ProjectManagement';
import ProjectManagementEdit from './pages/ProjectManagementEdit';
import ProjectManagementCreate from './pages/ProjectManagementCreate';
import NotificationButton from './components/NotificationButton';
import UserProjectList from './pages/UserProjectList';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 60px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  margin-left: ${props => props.showSidebar ? '240px' : '0'};
  padding-top: ${props => props.isLoginPage ? '0' : '60px'};
  transition: margin-left 0.3s ease;
`;

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AppContainer>
      {!isLoginPage && <Sidebar />}
      <MainContentWrapper showSidebar={!isLoginPage} isLoginPage={isLoginPage}>
        {!isLoginPage && (
          <TopBar>
            <NotificationButton />
          </TopBar>
        )}
        <Routes>
          {/* 정적 경로 */}
          <Route path="/login" element={<Login />} />
          
          {/* 프로젝트 관련 경로 */}
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/projects/create" element={
            <ProtectedRoute>
              <ProjectCreate />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/edit" element={
            <ProtectedRoute>
              <ProjectEdit />
            </ProtectedRoute>
          } />
          <Route path="/user/projects" element={
            <ProtectedRoute>
              <UserProjectList />
            </ProtectedRoute>
          } />
          
          {/* 문의 관련 경로 */}
          <Route path="/user/inquiries" element={<UserInquiryList />} />
          <Route path="/user/inquiries/create" element={<UserInquiryCreate />} />
          <Route path="/user/inquiries/:id" element={<UserInquiryDetail />} />
          <Route path="/admin/inquiries" element={<AdminInquiryList />} />
          <Route path="/admin/inquiry/:id" element={<AdminInquiryDetail />} />
          
          {/* 관리자 전용 경로 */}
          <Route path="/dashboard-admin" element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/create" element={
            <ProtectedRoute>
              <UserCreate />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id/edit" element={
            <ProtectedRoute>
              <UserEdit />
            </ProtectedRoute>
          } />
          <Route path="/admin/projects" element={
            <ProtectedRoute>
              <ProjectManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/projects/create" element={
            <ProtectedRoute>
              <ProjectManagementCreate />
            </ProtectedRoute>
          } />
          <Route path="/admin/projects/:id/edit" element={
            <ProtectedRoute>
              <ProjectManagementEdit />
            </ProtectedRoute>
          } />
          
          {/* 일반 사용자 경로 */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* 기본 경로 */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </MainContentWrapper>
    </AppContainer>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 