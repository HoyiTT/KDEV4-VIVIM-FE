import { BrowserRouter, Routes, Route } from 'react-router-dom';
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


import UserProjectList from './pages/UserProjectList';
import ProjectPostCreate from './pages/ProjectPostCreate';
import ProjectPostDetail from './pages/ProjectPostDetail';
import ProjectPostModify from './pages/ProjectPostModify';
import AdminInquiry from './pages/AdminInquiry';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard-admin" element={
          <ProtectedRoute>
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin-inquiry" element={<AdminInquiry />} />

        <Route path="/projectCreate" element={
          <ProtectedRoute>
            <ProjectCreate />
          </ProtectedRoute>
        } />
        <Route path="/projectModify/:projectId" element={
          <ProtectedRoute>
            <ProjectModify />
          </ProtectedRoute>
        } />
        <Route path="/company-management" element={
          <ProtectedRoute>
            <CompanyManagement />
          </ProtectedRoute>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/company-create" element={
          <ProtectedRoute>
            <CompanyCreate />
          </ProtectedRoute>
        } />
        <Route path="/user-create" element={
          <ProtectedRoute>
            <UserCreate />
          </ProtectedRoute>
        } />
        <Route path="/company-edit/:id" element={
          <ProtectedRoute>
            <CompanyEdit />
          </ProtectedRoute>
        } />
        <Route path="/project-list" element={
          <ProtectedRoute>
            <UserProjectList />
          </ProtectedRoute>
        } />
        <Route path="/admin-projects" element={
          <ProtectedRoute>
            <AdminProjectList />
          </ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } />
        <Route path="/project/:projectId/post/:postId" element={
          <ProtectedRoute>
            <ProjectPostDetail />
          </ProtectedRoute>
        } />
        <Route path="/project/:projectId/post/create" element={
          <ProtectedRoute>
            <ProjectPostCreate />
          </ProtectedRoute>
        } />
        <Route path="/project/:projectId/post/:postId/modify" element={
          <ProtectedRoute>
            <ProjectPostModify />
          </ProtectedRoute>
        } />
        <Route path="/user-edit/:userId" element={<UserEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
