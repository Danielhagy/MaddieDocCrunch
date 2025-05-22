import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TrackedUrlCard = ({ trackedUrl, onToggle, onDelete, notifications = 0 }) => {
  const [loading, setLoading] = useState(false);

  const formatLastScanned = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(trackedUrl.id, !trackedUrl.is_active);
      toast.success(
        trackedUrl.is_active ? 'Tracking paused' : 'Tracking resumed'
      );
    } catch (error) {
      toast.error('Failed to update tracking status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to stop tracking "${trackedUrl.name}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await onDelete(trackedUrl.id);
      toast.success('Stopped tracking URL');
    } catch (error) {
      toast.error('Failed to delete tracked URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className={`tracked-url-card ${trackedUrl.is_active ? 'active' : 'paused'}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {notifications > 0 && (
        <div className="notification-badge">
          <i className="fas fa-bell"></i>
          {notifications}
        </div>
      )}

      <div className="card-header">
        <div className="card-title">
          <h4>{trackedUrl.name}</h4>
          <div className="card-status">
            <div className={`status-indicator ${trackedUrl.is_active ? 'active' : 'paused'}`}>
              <i className={`fas ${trackedUrl.is_active ? 'fa-radar' : 'fa-pause'}`}></i>
              {trackedUrl.is_active ? 'Monitoring' : 'Paused'}
            </div>
          </div>
        </div>
        
        <div className="card-actions">
          <motion.button
            className="action-btn toggle"
            onClick={handleToggle}
            disabled={loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={trackedUrl.is_active ? 'Pause tracking' : 'Resume tracking'}
          >
            <i className={`fas ${trackedUrl.is_active ? 'fa-pause' : 'fa-play'}`}></i>
          </motion.button>
          
          <motion.button
            className="action-btn delete"
            onClick={handleDelete}
            disabled={loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Stop tracking"
          >
            <i className="fas fa-trash"></i>
          </motion.button>
        </div>
      </div>

      <div className="card-content">
        <div className="url-info">
          <a 
            href={trackedUrl.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="url-link"
          >
            <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem' }}></i>
            {trackedUrl.url.length > 50 ? 
              trackedUrl.url.substring(0, 50) + '...' : 
              trackedUrl.url
            }
          </a>
        </div>

        <div className="tracking-stats">
          <div className="stat-item">
            <span className="stat-label">Last Scanned</span>
            <span className="stat-value">{formatLastScanned(trackedUrl.last_scanned)}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Events Found</span>
            <span className="stat-value">{trackedUrl.last_event_count || 0}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Scan Interval</span>
            <span className="stat-value">{trackedUrl.scan_interval} min</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackedUrlCard;
