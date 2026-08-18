import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainMapLayout } from './layouts/MainMapLayout';
import { AuthLayout } from './pages/AuthLayout';
import { useUserStore } from './store/useUserStore';
import { useProjectStore } from './store/useProjectStore';

function App() {
  const fetchUsers = useUserStore(state => state.fetchUsers);
  const fetchProjects = useProjectStore(state => state.fetchProjects);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, [fetchUsers, fetchProjects]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMapLayout />} />
        <Route path="/login" element={<AuthLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
