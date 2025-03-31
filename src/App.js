import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectCreate from './pages/ProjectCreate';
import ProjectModify from './pages/ProjectModify';
import CompanyManagement from './pages/CompanyManagement';
import UserManagement from './pages/UserManagement';
import CompanyCreate from './pages/CompanyCreate';
import UserCreate from './pages/UserCreate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projectCreate" element={<ProjectCreate />} />
        <Route path="/projectModify/:projectId" element={<ProjectModify />} />
        <Route path="/company-management" element={<CompanyManagement />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/company-create" element={<CompanyCreate />} />
        <Route path="/user-create" element={<UserCreate />} />
      </Routes>
    </Router>
  );
}

export default App;
