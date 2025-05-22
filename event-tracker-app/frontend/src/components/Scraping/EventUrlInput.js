import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EventUrlInput = ({ onFindEvents, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a website URL to search for events');
      return;
    }

    try {
      new URL(url);
      onFindEvents(url);
    } catch (error) {
      toast.error('Please enter a valid website URL (like https://example.com)');
    }
  };

  const handleQuickFill = (exampleUrl) => {
    setUrl(exampleUrl);
  };

  return (
    <motion.div 
      className="event-url-input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="input-section">
        <h2 className="section-title">
          <i className="fas fa-calendar-star" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i>
          Find Events on Any Website
        </h2>
        <p className="section-subtitle">
          Enter a website URL and our smart system will automatically detect all events, conferences, meetings, and activities
        </p>
      </div>

      <form onSubmit={handleSubmit} className="url-form">
        <div className="url-input-row">
          <div className="url-input-wrapper">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://eventbrite.com)"
              className="url-input-field"
              disabled={loading}
            />
          </div>
          <motion.button
            type="submit"
            className="find-events-btn"
            disabled={loading || !url.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Searching...
              </>
            ) : (
              <>
                <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
                Find Events
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="example-sites">
        <p className="examples-title">Popular event websites to try:</p>
        <div className="example-buttons">
          {[
            { url: 'https://www.eventbrite.com/d/ca--san-francisco/events/', name: 'Eventbrite', icon: 'fas fa-ticket-alt' },
            { url: 'https://events.stanford.edu/', name: 'Stanford Events', icon: 'fas fa-graduation-cap' },
            { url: 'https://www.meetup.com/find/events/', name: 'Meetup', icon: 'fas fa-users' },
            { url: 'https://facebook.com/events/explore/', name: 'Facebook Events', icon: 'fab fa-facebook' },
            { url: 'https://www.ticketmaster.com/search?tm_link=tm_homeA_header_search', name: 'Ticketmaster', icon: 'fas fa-music' },
            { url: 'https://www.universe.com/events/', name: 'Universe', icon: 'fas fa-star' }
          ].map((example, index) => (
            <motion.button
              key={index}
              className="example-btn"
              onClick={() => handleQuickFill(example.url)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={example.icon} style={{ marginRight: '0.5rem' }}></i>
              {example.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="pro-tip" style={{
        background: '#16213e',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginTop: '1.5rem',
        border: '1px solid #374151'
      }}>
        <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          <i className="fas fa-lightbulb" style={{ marginRight: '0.5rem' }}></i>
          Pro Tip
        </div>
        <p style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}>
          Works best with event pages, calendar pages, and conference websites. 
          The system automatically detects event names, dates, descriptions, and locations.
        </p>
      </div>
    </motion.div>
  );
};

export default EventUrlInput;
