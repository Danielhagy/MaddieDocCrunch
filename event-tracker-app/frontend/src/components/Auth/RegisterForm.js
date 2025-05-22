import React, { useState } from 'react';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
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

  const validateForm = () => {
    const newErrors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await api.register(registerData);
      login(response.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.path] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.error || 'Registration failed. Please try again.' 
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
        <label htmlFor="displayName" className="form-label">
          <i className="fas fa-user"></i>
          Display Name
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="form-input"
          placeholder="Your display name"
        />
        {errors.displayName && <div className="form-error">{errors.displayName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="username" className="form-label">
          <i className="fas fa-at"></i>
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="form-input"
          placeholder="Choose a username"
          required
        />
        {errors.username && <div className="form-error">{errors.username}</div>}
      </div>

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
          placeholder="Choose a strong password"
          required
        />
        {errors.password && <div className="form-error">{errors.password}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          <i className="fas fa-lock"></i>
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="form-input"
          placeholder="Confirm your password"
          required
        />
        {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
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
            Creating Account...
          </>
        ) : (
          <>
            <i className="fas fa-user-plus"></i>
            Create Account
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
