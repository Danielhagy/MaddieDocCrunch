import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import RegisterForm from '../components/Auth/RegisterForm';
import OAuthButton from '../components/Auth/OAuthButton';
import { OAUTH_PROVIDER } from '../utils/constants';
import '../styles/components.css';

const Register = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = 'Join Team - DocumentCrunch Event Hub';
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
          <i className="fas fa-handshake"></i>
          Join Maddie's Team!
        </h1>
        <p className="page-subtitle">
          Become part of DocumentCrunch's premier event tracking division
        </p>
      </div>

      <div className="form-container slide-in">
        <div className="team-welcome" style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'var(--surface-light)',
          borderRadius: '1rem',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>í¾¯</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>DocumentCrunch Event Hub</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Led by Maddie â€¢ Powered by Innovation â€¢ Driven by Results
          </p>
        </div>

        <div className="auth-options">
          <OAuthButton provider={OAUTH_PROVIDER} />
          
          <div className="divider" style={{ 
            textAlign: 'center', 
            margin: '1.5rem 0',
            position: 'relative',
            color: 'var(--text-muted)'
          }}>
            <span style={{ 
              background: 'var(--surface)', 
              padding: '0 1rem',
              position: 'relative',
              zIndex: 1
            }}>
              OR
            </span>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'var(--border)',
              zIndex: 0
            }}></div>
          </div>

          <RegisterForm />
        </div>

        <div className="auth-footer" style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Already on the team?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--primary)', 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
