import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import EventUrlInput from '../components/Scraping/EventUrlInput';
import EventDisplay from '../components/Scraping/EventDisplay';
import EventDownload from '../components/Scraping/EventDownload';
import api from '../utils/api';
import '../styles/simple-events.css';

const SimpleEventScraper = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [fetchMethod, setFetchMethod] = useState('');

  useEffect(() => {
    document.title = 'Find Events - DocumentCrunch Event Hub';
  }, []);

  const handleFindEvents = async (url) => {
    setLoading(true);
    setEvents([]);
    setSelectedEvents([]);
    setCurrentUrl(url);
    setFetchMethod('');

    try {
      const loadingToast = toast.loading(
        <>
          <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
          Analyzing website for events...
        </>, 
        { id: 'search' }
      );
      
      const response = await api.post('/scraping/analyze', { url });
      
      setEvents(response.data.events || []);
      setFetchMethod(response.data.fetchMethod || '');
      
      if (response.data.events && response.data.events.length > 0) {
        toast.success(
          <>
            <i className="fas fa-party-horn" style={{ marginRight: '0.5rem' }}></i>
            Found {response.data.events.length} events using {response.data.fetchMethod}!
          </>, 
          { id: 'search' }
        );
      } else {
        toast.error(
          <>
            <i className="fas fa-search-minus" style={{ marginRight: '0.5rem' }}></i>
            No events found. Try an events page or calendar page.
          </>, 
          { id: 'search' }
        );
      }
      
    } catch (error) {
      console.error('Event search error:', error);
      let errorMessage = 'Could not search this website for events.';
      
      if (error.response?.status === 500) {
        errorMessage = 'This website might be protected or temporarily unavailable.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(
        <>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
          {errorMessage}
        </>, 
        { id: 'search' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedEvents(newSelection);
  };

  const handleDownloadComplete = () => {
    console.log('Download completed for:', currentUrl);
    toast.success(
      <>
        <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
        Events successfully saved to Excel!
      </>
    );
  };

  const handleStartOver = () => {
    setEvents([]);
    setSelectedEvents([]);
    setCurrentUrl('');
    setFetchMethod('');
  };

  return (
    <div className="event-scraper fade-in">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1a2e',
            color: '#ffffff',
            border: '1px solid #374151'
          }
        }}
      />

      <div className="page-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">
            <i className="fas fa-calendar-star" style={{ marginRight: '0.5rem' }}></i>
            DocumentCrunch Event Finder
          </h1>
          <p className="page-subtitle">
            Maddie's intelligent tool to discover and extract events from any website
          </p>
        </motion.div>

        {events.length > 0 && (
          <motion.button
            className="start-over-btn"
            onClick={handleStartOver}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: '#374151',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            <i className="fas fa-redo" style={{ marginRight: '0.5rem' }}></i>
            Search Different Website
          </motion.button>
        )}
      </div>

      <EventUrlInput 
        onFindEvents={handleFindEvents}
        loading={loading}
      />

      {events.length > 0 && (
        <>
          <motion.div 
            className="analysis-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">
              <i className="fas fa-check-circle" style={{ fontSize: '2rem' }}></i>
            </div>
            <div className="success-content">
              <h3>Events Discovered Successfully!</h3>
              <p>
                Found {events.length} events from <strong>{new URL(currentUrl).hostname}</strong>
                {fetchMethod && ` using ${fetchMethod}`}
              </p>
            </div>
          </motion.div>

          <EventDisplay
            events={events}
            onSelectionChange={handleSelectionChange}
            selectedEvents={selectedEvents}
          />

          <EventDownload
            url={currentUrl}
            selectedEvents={selectedEvents}
            onDownloadComplete={handleDownloadComplete}
          />
        </>
      )}

      {!events.length && !loading && (
        <motion.div 
          className="getting-started"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: '#1a1a2e',
            border: '1px solid #374151',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            marginTop: '2rem'
          }}
        >
          <h3 style={{ color: '#ffffff', marginBottom: '2rem', fontSize: '1.5rem' }}>
            <i className="fas fa-brain" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
            How Our Smart Event Detection Works:
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                <i className="fas fa-database" style={{ color: '#6366f1' }}></i>
              </div>
              <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Structured Data</h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                Finds events marked with JSON-LD and Schema.org data
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                <i className="fas fa-bullseye" style={{ color: '#ec4899' }}></i>
              </div>
              <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Pattern Recognition</h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                Detects event patterns in HTML and content structure
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                <i className="fas fa-calendar-alt" style={{ color: '#10b981' }}></i>
              </div>
              <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Date Intelligence</h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                Automatically finds dates, times, and related event information
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: '#16213e',
            borderRadius: '1rem'
          }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '1rem' }}>
              <i className="fas fa-rocket" style={{ marginRight: '0.5rem' }}></i>
              Best Results With:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              color: '#d1d5db',
              fontSize: '0.875rem'
            }}>
              <div>
                <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                Event listing pages
              </div>
              <div>
                <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                Conference websites
              </div>
              <div>
                <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                Calendar pages
              </div>
              <div>
                <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                Meetup groups
              </div>
              <div>
                <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                University events
              </div>
              <div>
                <i className="fas fa-check" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                Ticketing sites
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SimpleEventScraper;
