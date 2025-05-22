import React, { useState } from 'react';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.login(formData);
      login(response.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.path] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.error || 'Login failed. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {errors.general && (
        <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {errors.general}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          <i className="fas fa-envelope"></i>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter your email"
          required
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          <i className="fas fa-lock"></i>
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter your password"
          required
        />
        {errors.password && <div className="form-error">{errors.password}</div>}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            Signing In...
          </>
        ) : (
          <>
            <i className="fas fa-sign-in-alt"></i>
            Sign In
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
