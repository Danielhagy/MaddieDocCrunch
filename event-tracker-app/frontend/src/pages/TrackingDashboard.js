import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import AddUrlForm from '../components/Tracking/AddUrlForm';
import TrackedUrlCard from '../components/Tracking/TrackedUrlCard';
import NotificationCenter from '../components/Notifications/NotificationCenter';
import api from '../utils/api';
import { connectWebSocket } from '../utils/websocket';
import '../styles/tracking.css';

const TrackingDashboard = () => {
  const { user } = useAuth();
  const [trackedUrls, setTrackedUrls] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    document.title = 'URL Tracking - DocumentCrunch Event Hub';
    fetchData();
    
    // Connect WebSocket for real-time notifications
    if (user) {
      const ws = connectWebSocket(user);
      setSocket(ws);
      
      ws.on('new_events', (data) => {
        toast.success(
          `í¾‰ ${data.newEventCount} new events found on ${data.urlName}!`,
          { duration: 5000 }
        );
        
        // Refresh data to show updated counts
        fetchData();
      });
      
      return () => {
        ws.disconnect();
      };
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [urlsResponse, notificationsResponse] = await Promise.all([
        api.get('/tracking/urls'),
        api.get('/tracking/notifications')
      ]);
      
      setTrackedUrls(urlsResponse.data.trackedUrls);
      setNotifications(notificationsResponse.data.notifications);
      setUnreadCount(notificationsResponse.data.unreadCount);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async (urlData) => {
    try {
      await api.post('/tracking/urls', urlData);
      toast.success(`Started tracking ${urlData.name}!`);
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding URL:', error);
      toast.error(error.response?.data?.error || 'Failed to add URL');
      throw error;
    }
  };

  const handleToggleUrl = async (id, isActive) => {
    try {
      await api.put(`/tracking/urls/${id}`, { is_active: isActive });
      fetchData();
    } catch (error) {
      console.error('Error toggling URL:', error);
      throw error;
    }
  };

  const handleDeleteUrl = async (id) => {
    try {
      await api.delete(`/tracking/urls/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting URL:', error);
      throw error;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/tracking/notifications/${notificationId}/read`);
      fetchData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/tracking/notifications/read-all');
      fetchData();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationCountForUrl = (urlId) => {
    return notifications.filter(n => n.tracked_url_id === urlId && !n.is_read).length;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tracking dashboard...</p>
      </div>
    );
  }

  return (
    <div className="tracking-dashboard fade-in">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <i className="fas fa-radar" style={{ marginRight: '0.75rem', color: '#6366f1' }}></i>
              URL Tracking Dashboard
            </h1>
            <p className="page-subtitle">
              Monitor websites for new events automatically every 10 minutes
            </p>
          </div>
          
          <div className="header-actions">
            <motion.button
              className="notification-btn"
              onClick={() => setShowNotifications(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </motion.button>
            
            <motion.button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
              Track New URL
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div 
        className="stats-overview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-link" style={{ color: '#6366f1' }}></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{trackedUrls.length}</div>
            <div className="stat-label">URLs Tracked</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-play" style={{ color: '#10b981' }}></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {trackedUrls.filter(url => url.is_active).length}
            </div>
            <div className="stat-label">Active Monitoring</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-alt" style={{ color: '#f59e0b' }}></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {trackedUrls.reduce((sum, url) => sum + (url.last_event_count || 0), 0)}
            </div>
            <div className="stat-label">Total Events Found</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-bell" style={{ color: '#ec4899' }}></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{unreadCount}</div>
            <div className="stat-label">New Notifications</div>
          </div>
        </div>
      </motion.div>

      {/* Add URL Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AddUrlForm 
                onSubmit={handleAddUrl}
                onCancel={() => setShowAddForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracked URLs Grid */}
      {trackedUrls.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="empty-icon">
            <i className="fas fa-radar" style={{ fontSize: '4rem', color: '#6b7280' }}></i>
          </div>
          <h3>No URLs Being Tracked</h3>
          <p>Start monitoring websites for new events by adding your first URL.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
            Add Your First URL
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="tracked-urls-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {trackedUrls.map((url, index) => (
            <motion.div
              key={url.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TrackedUrlCard
                trackedUrl={url}
                onToggle={handleToggleUrl}
                onDelete={handleDeleteUrl}
                notifications={getNotificationCountForUrl(url.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};

export default TrackingDashboard;
