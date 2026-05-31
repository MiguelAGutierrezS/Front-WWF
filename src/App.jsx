import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainMapLayout } from './layouts/MainMapLayout';
import { AuthLayout } from './pages/AuthLayout';

function App() {
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
