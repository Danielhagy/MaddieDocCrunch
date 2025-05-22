import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './utils/auth';
import Header from './components/Common/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SimpleEventScraper from './pages/SimpleEventScraper';
import './styles/globals.css';
import './styles/components.css';
import './styles/simple-events.css';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Loading...</div>;
  
  // Allow access without authentication for now (for testing)
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/events" element={
                <ProtectedRoute>
                  <SimpleEventScraper />
                </ProtectedRoute>
              } />
              <Route path="/scraping" element={
                <ProtectedRoute>
                  <SimpleEventScraper />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
