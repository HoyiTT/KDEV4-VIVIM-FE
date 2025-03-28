import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Dashboard2 from './pages/Dashboard2';
import ProjectCreate from './pages/ProjectCreate';
import ProjectCreate2 from './pages/ProjectCreate2';
import ProjectPost from './pages/ProjectPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard2" element={<Dashboard2 />} />
        <Route path="/projectCreate" element={<ProjectCreate />} />
        <Route path="/projectCreate2" element={<ProjectCreate2 />} />
        <Route path="/projectPost" element={<ProjectPost />} />
      </Routes>
    </Router>
  );
}

export default App;
