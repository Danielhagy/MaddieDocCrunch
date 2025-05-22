import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EventDisplay = ({ events, onSelectionChange, selectedEvents }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [sortedEvents, setSortedEvents] = useState(events);

  // Update sorted events when events prop changes
  React.useEffect(() => {
    setSortedEvents(events);
  }, [events]);

  // Sort events based on current sort configuration
  React.useEffect(() => {
    if (sortConfig.key) {
      const sorted = [...events].sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        // Handle date sorting specially
        if (sortConfig.key === 'date') {
          const aDate = parseDate(aValue);
          const bDate = parseDate(bValue);
          
          if (sortConfig.direction === 'asc') {
            return aDate - bDate;
          } else {
            return bDate - aDate;
          }
        }

        // Handle string sorting
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      setSortedEvents(sorted);
    } else {
      setSortedEvents(events);
    }
  }, [events, sortConfig]);

  const parseDate = (dateString) => {
    if (!dateString) return new Date(0);
    
    // Try to parse various date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Fallback to current date if parsing fails
    return new Date();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    
    // If clicking the same column, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    console.log(`Sorting by ${key} in ${direction} order`);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <i className="fas fa-sort" style={{ opacity: 0.3, marginLeft: '0.5rem' }}></i>;
    }
    
    if (sortConfig.direction === 'asc') {
      return <i className="fas fa-sort-up" style={{ color: '#6366f1', marginLeft: '0.5rem' }}></i>;
    } else {
      return <i className="fas fa-sort-down" style={{ color: '#6366f1', marginLeft: '0.5rem' }}></i>;
    }
  };

  const handleEventToggle = (event) => {
    const isSelected = selectedEvents.find(e => e.id === event.id);
    
    if (isSelected) {
      onSelectionChange(selectedEvents.filter(e => e.id !== event.id));
    } else {
      onSelectionChange([...selectedEvents, event]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...sortedEvents]);
    }
    setSelectAll(!selectAll);
  };

  const getConfidenceColor = (confidence) => {
    switch(confidence) {
      case 'High': return '#10b981';
      case 'Medium': return '#f59e0b'; 
      case 'Low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch(confidence) {
      case 'High': return 'fas fa-bullseye';
      case 'Medium': return 'fas fa-search-plus'; 
      case 'Low': return 'fas fa-question-circle';
      default: return 'fas fa-file-alt';
    }
  };

  const getSourceIcon = (source) => {
    if (source.includes('Structured Data')) return 'fas fa-database';
    if (source.includes('Microdata')) return 'fas fa-code';
    if (source.includes('Smart Detection')) return 'fas fa-brain';
    return 'fas fa-search';
  };

  if (!events || events.length === 0) {
    return (
      <div className="no-events-found">
        <div className="no-events-icon">
          <i className="fas fa-search" style={{ fontSize: '4rem', color: '#6b7280' }}></i>
        </div>
        <h3>No Events Found</h3>
        <p>
          We couldn't find any events on this website. Try these tips:
        </p>
        <ul style={{ 
          textAlign: 'left', 
          color: '#a1a1aa', 
          marginTop: '1rem',
          listStyle: 'none',
          padding: 0
        }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <i className="fas fa-arrow-right" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
            Try an events or calendar page
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <i className="fas fa-arrow-right" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
            Look for URLs with "events", "calendar", or "conferences"
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <i className="fas fa-arrow-right" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
            Some websites block automated access
          </li>
          <li>
            <i className="fas fa-arrow-right" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
            Try a different event website
          </li>
        </ul>
      </div>
    );
  }

  return (
    <motion.div 
      className="events-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="events-header">
        <div className="events-found">
          <h3>
            <i className="fas fa-party-horn" style={{ color: '#10b981', marginRight: '0.5rem' }}></i>
            Found {events.length} Events!
          </h3>
          <p>Select the events you want to save to Excel</p>
        </div>
        <motion.button
          className="select-all-events"
          onClick={handleSelectAll}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className={selectAll ? 'fas fa-check-square' : 'fas fa-square'} style={{ marginRight: '0.5rem' }}></i>
          {selectAll ? 'Deselect All' : 'Select All'}
        </motion.button>
      </div>

      <div className="selection-summary">
        <span className="selected-count">
          <i className="fas fa-mouse-pointer" style={{ marginRight: '0.5rem' }}></i>
          {selectedEvents.length} of {events.length} events selected
        </span>
        {selectedEvents.length > 0 && (
          <span style={{ color: '#10b981', marginLeft: '1rem' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
            Ready to download!
          </span>
        )}
      </div>

      {/* Sorting Controls */}
      <div className="sorting-controls" style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#16213e',
        borderRadius: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ color: '#ffffff', fontWeight: '600' }}>
          <i className="fas fa-sort" style={{ marginRight: '0.5rem' }}></i>
          Sort by:
        </span>
        
        <button
          className={`sort-btn ${sortConfig.key === 'name' ? 'active' : ''}`}
          onClick={() => handleSort('name')}
          style={{
            background: sortConfig.key === 'name' ? '#6366f1' : '#374151',
            color: '#ffffff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          Event Name
          {getSortIcon('name')}
        </button>
        
        <button
          className={`sort-btn ${sortConfig.key === 'date' ? 'active' : ''}`}
          onClick={() => handleSort('date')}
          style={{
            background: sortConfig.key === 'date' ? '#6366f1' : '#374151',
            color: '#ffffff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          Date
          {getSortIcon('date')}
        </button>
        
        <button
          className={`sort-btn ${sortConfig.key === 'confidence' ? 'active' : ''}`}
          onClick={() => handleSort('confidence')}
          style={{
            background: sortConfig.key === 'confidence' ? '#6366f1' : '#374151',
            color: '#ffffff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          Confidence
          {getSortIcon('confidence')}
        </button>

        {sortConfig.key && (
          <button
            onClick={() => setSortConfig({ key: null, direction: 'asc' })}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
            Clear Sort
          </button>
        )}
      </div>

      <div className="events-grid">
        {sortedEvents.map((event, index) => {
          const isSelected = selectedEvents.find(e => e.id === event.id);
          
          return (
            <motion.div
              key={event.id}
              className={`event-card ${isSelected ? 'selected' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => handleEventToggle(event)}
            >
              <div className="event-card-header">
                <div className="event-checkbox">
                  <i className={isSelected ? 'fas fa-check-square' : 'far fa-square'} 
                     style={{ color: isSelected ? '#10b981' : '#6b7280', fontSize: '1.25rem' }}></i>
                </div>
                <div className="event-meta">
                  <span 
                    className="confidence-badge"
                    style={{ color: getConfidenceColor(event.confidence) }}
                  >
                    <i className={getConfidenceIcon(event.confidence)} style={{ marginRight: '0.25rem' }}></i>
                    {event.confidence}
                  </span>
                  <span className="source-badge" style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                    <i className={getSourceIcon(event.source)} style={{ marginRight: '0.25rem' }}></i>
                    {event.source}
                  </span>
                </div>
              </div>

              <div className="event-content">
                <h4 className="event-name">{event.name}</h4>
                
                <div className="event-details">
                  {event.date && event.date !== 'Date not found' && (
                    <div className="event-detail">
                      <span className="detail-icon">
                        <i className="fas fa-calendar-alt" style={{ color: '#6366f1' }}></i>
                      </span>
                      <span className="detail-text">{event.date}</span>
                    </div>
                  )}
                  
                  {event.time && event.time !== 'Time not specified' && (
                    <div className="event-detail">
                      <span className="detail-icon">
                        <i className="fas fa-clock" style={{ color: '#10b981' }}></i>
                      </span>
                      <span className="detail-text">{event.time}</span>
                    </div>
                  )}
                  
                  {event.location && event.location !== 'Location not specified' && (
                    <div className="event-detail">
                      <span className="detail-icon">
                        <i className="fas fa-map-marker-alt" style={{ color: '#ec4899' }}></i>
                      </span>
                      <span className="detail-text">{event.location}</span>
                    </div>
                  )}
                </div>

                {event.description && event.description !== 'No description available' && (
                  <p className="event-description">
                    {event.description.length > 120 
                      ? event.description.substring(0, 120) + '...' 
                      : event.description}
                  </p>
                )}

                {event.url && event.url !== event.url && (
                  <div className="event-link">
                    <a 
                      href={event.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#6366f1', fontSize: '0.75rem', textDecoration: 'none' }}
                    >
                      <i className="fas fa-external-link-alt" style={{ marginRight: '0.25rem' }}></i>
                      View Event Details
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="events-summary" style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#16213e',
        borderRadius: '0.5rem',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>
          <i className="fas fa-chart-bar" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
          Detection Summary
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {['High', 'Medium', 'Low'].map(conf => {
            const count = events.filter(e => e.confidence === conf).length;
            return count > 0 ? (
              <div key={conf} style={{ textAlign: 'center' }}>
                <div style={{ 
                  color: getConfidenceColor(conf), 
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {count}
                </div>
                <div style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                  <i className={getConfidenceIcon(conf)} style={{ marginRight: '0.25rem' }}></i>
                  {conf} Confidence
                </div>
              </div>
            ) : null;
          })}
        </div>
        
        {sortConfig.key && (
          <div style={{ marginTop: '1rem', color: '#a1a1aa', fontSize: '0.875rem' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
            Sorted by {sortConfig.key} ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EventDisplay;
