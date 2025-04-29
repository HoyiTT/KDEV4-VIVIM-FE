import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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
import { setNavigate } from './utils/axiosInstance';

const AppContent = () => {
  const navigate = useNavigate();

  // axiosInstance에 navigate 함수 설정
  React.useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/admin-inquiry" element={<AdminInquiry />} />
            <Route path="/admin-inquiry-list" element={<AdminInquiryList />} />
            <Route path="/admin-inquiry-list/:id" element={<AdminInquiryDetail />} />
            <Route path="/admin-inquiry-list/:id/edit" element={<AdminInquiryEdit />} />
            <Route path="/projectCreate" element={<ProjectCreate />} />
            <Route path="/projectModify/:projectId" element={<ProjectModify />} />
            <Route path="/company-management" element={<CompanyManagement />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/company-create" element={<CompanyCreate />} />
            <Route path="/user-create" element={<UserCreate />} />
            <Route path="/company-edit/:id" element={<CompanyEdit />} />
            <Route path="/project-list" element={<UserProjectList />} />
            <Route path="/admin-projects" element={<AdminProjectList />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/project/:projectId/post/:postId" element={<ProjectPostDetail />} />
            <Route path="/project/:projectId/post/create" element={<ProjectPostCreate />} />
            <Route path="/project/:projectId/post/:postId/modify" element={<ProjectPostModify />} />
            <Route path="/approval/:id" element={<ApprovalDetail />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/user-edit/:userId" element={<UserEdit />} />
          </Routes>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
