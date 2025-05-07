import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/DashboardAdmin';
import ProjectCreate from './pages/ProjectCreate';
import ProjectModify from './pages/ProjectModify';
import CompanyManagement from './pages/CompanyManagement';
import UserManagement from './pages/UserManagement';
import CompanyCreate from './pages/CompanyCreate';
import UserCreate from './pages/UserCreate';
import CompanyEdit from './pages/CompanyEdit';
import AdminProjectList from './pages/AdminProjectList';
import AdminProjects from './pages/AdminProjects';
import ProjectDetail from './pages/ProjectDetail';
import UserEdit from './pages/UserEdit';
import AuditLog from './pages/AuditLog';
import ApprovalDetail from './pages/ApprovalDetail';
import UserProjectList from './pages/UserProjectList';
import ProjectPostCreate from './pages/ProjectPostCreate';
import ProjectPostDetail from './pages/ProjectPostDetail';
import ProjectPostModify from './pages/ProjectPostModify';
import AdminInquiry from './pages/AdminInquiry';
import AdminInquiryList from './pages/AdminInquiryList';
import AdminInquiryDetail from './pages/AdminInquiryDetail';
import AdminInquiryEdit from './pages/AdminInquiryEdit';
import styled from 'styled-components';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AppContainer>
      {!isLoginPage && <Sidebar />}
      <MainContentWrapper isLoginPage={isLoginPage}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard-admin" element={<ProtectedRoute><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin-inquiry" element={<ProtectedRoute><AdminInquiry /></ProtectedRoute>} />
          <Route path="/admin-inquiry-list" element={<ProtectedRoute><AdminInquiryList /></ProtectedRoute>} />
          <Route path="/admin-inquiry-list/:id" element={<ProtectedRoute><AdminInquiryDetail /></ProtectedRoute>} />
          <Route path="/admin-inquiry-list/:id/edit" element={<ProtectedRoute><AdminInquiryEdit /></ProtectedRoute>} />
          <Route path="/projectCreate" element={<ProtectedRoute><ProjectCreate /></ProtectedRoute>} />
          <Route path="/projectModify/:projectId" element={<ProtectedRoute><ProjectModify /></ProtectedRoute>} />
          <Route path="/company-management" element={<ProtectedRoute><CompanyManagement /></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/company-create" element={<ProtectedRoute><CompanyCreate /></ProtectedRoute>} />
          <Route path="/user-create" element={<ProtectedRoute><UserCreate /></ProtectedRoute>} />
          <Route path="/company-edit/:id" element={<ProtectedRoute><CompanyEdit /></ProtectedRoute>} />
          <Route path="/project-list" element={<ProtectedRoute><UserProjectList /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
          <Route path="/admin-projects" element={<ProtectedRoute><AdminProjectList /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/user-edit/:id" element={<ProtectedRoute><UserEdit /></ProtectedRoute>} />
          <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
          <Route path="/approval/:id" element={<ProtectedRoute><ApprovalDetail /></ProtectedRoute>} />
          <Route path="/project-post/create/:projectId" element={<ProtectedRoute><ProjectPostCreate /></ProtectedRoute>} />
          <Route path="/project-post/:id" element={<ProtectedRoute><ProjectPostDetail /></ProtectedRoute>} />
          <Route path="/project-post/modify/:id" element={<ProtectedRoute><ProjectPostModify /></ProtectedRoute>} />
        </Routes>
      </MainContentWrapper>
    </AppContainer>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  margin-left: ${props => props.isLoginPage ? '0' : '300px'};
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: ${props => props.isLoginPage ? '0' : '32px'};
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  z-index: 100;
  width: calc(100% - 300px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const NotificationButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #f1f5f9;
  }
`;

const NotificationBadge = styled.span`
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
`;

export default App;
