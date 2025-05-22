import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';

const Dashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard - DocumentCrunch Event Hub';
  }, []);

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <h1 className="page-title">
          {welcomeMessage()}, {user?.displayName || user?.username || 'Team Member'}! 
          <span style={{ 
            display: 'inline-block',
            animation: 'wave 2s ease-in-out infinite',
            transformOrigin: '70% 70%',
            fontSize: '2rem',
            marginLeft: '0.5rem'
          }}>
            <i className="fas fa-hand-paper" style={{ color: '#f59e0b' }}></i>
          </span>
        </h1>
        <p className="page-subtitle">
          Welcome to Maddie's DocumentCrunch Event Hub - Let's find some events!
        </p>
      </div>

      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          padding: '3rem 2rem',
          borderRadius: '1.5rem',
          marginBottom: '3rem',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            <i className="fas fa-calendar-star"></i>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
            Event Finder
          </h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Simply enter any website URL and we'll automatically find all the events for you. No technical knowledge required!
          </p>
          <Link to="/events">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-search"></i>
              Find Events Now
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: '#1a1a2e',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #374151'
          }}
        >
          <h3 style={{ color: '#6366f1', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <i className="fas fa-bullseye" style={{ marginRight: '0.5rem' }}></i>
            How It Works
          </h3>
          <div style={{ color: '#d1d5db' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#6366f1', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '50%', fontSize: '0.75rem' }}>1</span>
              <span>Enter any website URL</span>
            </div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#6366f1', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '50%', fontSize: '0.75rem' }}>2</span>
              <span>We automatically find events</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#6366f1', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '50%', fontSize: '0.75rem' }}>3</span>
              <span>Download to Excel</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: '#1a1a2e',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #374151'
          }}
        >
          <h3 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <i className="fas fa-clipboard-list" style={{ marginRight: '0.5rem' }}></i>
            What You Get
          </h3>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
              Event names and titles
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
              Dates and times
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
              Event descriptions
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <i className="fas fa-check" style={{ marginRight: '.5rem', color: '#10b981' }}></i>
              Locations and venues
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
              Website links
            </div>
            <div>
              <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
              Ready-to-use Excel file
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: '#1a1a2e',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #374151'
          }}
        >
          <h3 style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <i className="fas fa-trophy" style={{ marginRight: '0.5rem' }}></i>
            Team Status
          </h3>
          <div style={{ color: '#d1d5db' }}>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#16213e', borderRadius: '0.5rem' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
                System Online
              </div>
              <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>All systems operational</div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
              <strong>
                <i className="fas fa-user-tie" style={{ marginRight: '0.5rem' }}></i>
                Project Lead:
              </strong> Maddie<br/>
              <strong>
                <i className="fas fa-building" style={{ marginRight: '0.5rem' }}></i>
                Team:
              </strong> DocumentCrunch Event Division
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
