import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header fade-in">
      <div className="header-content">
        <Link to="/" className="logo">
          <i className="fas fa-file-chart-line"></i>
          <span className="logo-text">
            <span className="company-name">DocumentCrunch</span>
            <span className="app-name">Event Hub</span>
          </span>
        </Link>
        
        <nav className="nav-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </Link>
          <Link 
            to="/events" 
            className={`nav-link ${isActive('/events') || isActive('/scraping') ? 'active' : ''}`}
          >
            <i className="fas fa-calendar-star"></i>
            Find Events
          </Link>
          
          {user ? (
            <div className="user-menu">
              {user.avatarUrl && (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName} 
                  className="user-avatar"
                />
              )}
              <span className="user-name">
                {user.displayName || user.username}
              </span>
              <button 
                onClick={logout} 
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <i className="fas fa-sign-in-alt"></i>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
