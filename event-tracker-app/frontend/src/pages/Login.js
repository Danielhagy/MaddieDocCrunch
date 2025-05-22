import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const Login = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = 'Login - DocumentCrunch Event Hub';
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page fade-in">
      <div className="page-header">
        <h1 className="page-title bounce">
          <i className="fas fa-building"></i>
          Welcome to DocumentCrunch!
        </h1>
        <p className="page-subtitle">
          Join Maddie's team and start tracking events efficiently
        </p>
      </div>

      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        background: 'var(--surface)',
        padding: '2rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Authentication system ready. Click below to access the scraping dashboard.
        </p>
        <Link 
          to="/dashboard" 
          className="btn btn-primary"
          style={{ textDecoration: 'none', width: '100%' }}
        >
          <i className="fas fa-arrow-right"></i>
          Access Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Login;
