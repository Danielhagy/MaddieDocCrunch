import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';

const Login = () => {
  const { user, loading, login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    document.title = 'Login - DocumentCrunch Event Hub';
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let result;
      
      if (isRegistering) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        
        result = await register(formData);
      } else {
        result = await login({
          username: formData.username,
          password: formData.password
        });
      }

      if (result.success) {
        toast.success(
          isRegistering 
            ? `Welcome to DocumentCrunch, ${result.user.displayName}!` 
            : `Welcome back, ${result.user.displayName}!`
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  return (
    <div className="auth-page fade-in">
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <h1 className="auth-title">
            <i className="fas fa-building" style={{ color: '#6366f1', marginRight: '0.75rem' }}></i>
            DocumentCrunch Event Hub
          </h1>
          <p className="auth-subtitle">
            {isRegistering 
              ? 'Create your account to start tracking events' 
              : 'Sign in to access your event tracking dashboard'
            }
          </p>
        </div>

        <motion.div 
          className="auth-form-container"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="auth-toggle">
            <button 
              className={`toggle-btn ${!isRegistering ? 'active' : ''}`}
              onClick={() => !isRegistering || switchMode()}
            >
              Sign In
            </button>
            <button 
              className={`toggle-btn ${isRegistering ? 'active' : ''}`}
              onClick={() => isRegistering || switchMode()}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegistering && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="form-label">
                  <i className="fas fa-user" style={{ marginRight: '0.5rem' }}></i>
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Your display name"
                />
              </motion.div>
            )}

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-at" style={{ marginRight: '0.5rem' }}></i>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder={isRegistering ? "Choose a username" : "Username or email"}
                required
              />
            </div>

            {isRegistering && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="form-label">
                  <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </motion.div>
            )}

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-lock" style={{ marginRight: '0.5rem' }}></i>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            {isRegistering && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="form-label">
                  <i className="fas fa-lock" style={{ marginRight: '0.5rem' }}></i>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
              </motion.div>
            )}

            <motion.button 
              type="submit" 
              className="btn btn-primary auth-submit-btn"
              disabled={formLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {formLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  {isRegistering ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isRegistering ? 'fa-user-plus' : 'fa-sign-in-alt'}`} style={{ marginRight: '0.5rem' }}></i>
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </>
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p style={{ color: '#a1a1aa', textAlign: 'center', margin: 0 }}>
              {isRegistering 
                ? 'Already have an account? ' 
                : "Don't have an account? "
              }
              <button 
                onClick={switchMode}
                className="auth-switch-btn"
                type="button"
              >
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </motion.div>

        <div className="admin-notice">
          <div style={{ 
            background: '#16213e', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0' }}>
              <i className="fas fa-crown" style={{ marginRight: '0.5rem' }}></i>
              Admin Access
            </h4>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}>
              Super admin login: <strong>admin</strong> / <strong>admin</strong>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
