import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import '../styles/components.css';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Events - DocumentCrunch Event Hub';
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading DocumentCrunch events...</p>
      </div>
    );
  }

  return (
    <div className="events-page fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-calendar-check"></i>
          DocumentCrunch Events
        </h1>
        <p className="page-subtitle">
          Maddie's team event tracking & monitoring dashboard
        </p>
      </div>

      <div className="team-metrics" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="metric-card" style={{
          background: 'var(--surface)',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>í³Š</div>
          <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>Team Goal</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>100 Events/Month</div>
        </div>
        <div className="metric-card" style={{
          background: 'var(--surface)',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--success)' }}>í¾¯</div>
          <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>Progress</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>0% Complete</div>
        </div>
        <div className="metric-card" style={{
          background: 'var(--surface)',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>í±¥</div>
          <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>Team Lead</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Maddie</div>
        </div>
      </div>

      <div className="events-actions" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search DocumentCrunch events..."
            className="form-input"
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '2px solid var(--border)'
            }}
          />
        </div>
        
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            <i className="fas fa-filter"></i>
            Filter
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-robot"></i>
            Add Scraper
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>íº€</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: 'var(--text)'
          }}>
            Ready to Start, Team!
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Welcome to DocumentCrunch Event Hub! Maddie's team is ready to start tracking events. 
            Set up your first event scraper or manually add events to begin building our comprehensive database.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
              <i className="fas fa-plus"></i>
              Add Event Source
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '1.1rem' }}>
              <i className="fas fa-book"></i>
              View Documentation
            </button>
          </div>
        </div>
      ) : (
        <div className="events-grid">
          {/* Events will be displayed here when available */}
        </div>
      )}
    </div>
  );
};

export default Events;
