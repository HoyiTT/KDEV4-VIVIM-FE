import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CompanyManagement from './pages/CompanyManagement';
import ProjectPostCreate from './pages/ProjectPostCreate';
import ProjectPostDetail from './pages/ProjectPostDetail';
import ProjectPostModify from './pages/ProjectPostModify';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/companies" element={
          <ProtectedRoute>
            <CompanyManagement />
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
      </Routes>
    </Router>
  );
}

export default App;