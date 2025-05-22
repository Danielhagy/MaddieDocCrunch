import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{
      background: '#1a1a2e',
      padding: '1rem 2rem',
      borderBottom: '1px solid #374151',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{
          color: '#6366f1',
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          Ì≥ä DocumentCrunch Event Hub
          <span style={{
            fontSize: '0.8rem',
            color: '#a1a1aa',
            fontWeight: 'normal'
          }}>
            - Maddie's Team
          </span>
        </Link>
        
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              color: '#ffffff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Ìø† Dashboard
          </Link>
          <Link 
            to="/scraping" 
            style={{ 
              color: '#ffffff', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Ìµ∏Ô∏è Web Scraper
          </Link>
          <Link 
            to="/login" 
            style={{ 
              color: '#6366f1', 
              textDecoration: 'none',
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #6366f1'
            }}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
