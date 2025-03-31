import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectCreate from './pages/ProjectCreate';
import ProjectPost from './pages/ProjectPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projectCreate" element={<ProjectCreate />} />
        <Route path="/projectPost" element={<ProjectPost />} />
      </Routes>
    </Router>
  );
}

export default App;
