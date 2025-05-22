import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const NotificationCenter = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.is_read;
    return true;
  });

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_event': return 'fas fa-calendar-plus';
      case 'error': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-bell';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="notification-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="notification-center"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="notification-header">
              <h3>
                <i className="fas fa-bell" style={{ marginRight: '0.5rem' }}></i>
                Notifications
              </h3>
              
              <div className="header-actions">
                {notifications.some(n => !n.is_read) && (
                  <button 
                    className="mark-all-read-btn"
                    onClick={onMarkAllAsRead}
                  >
                    <i className="fas fa-check-double" style={{ marginRight: '0.25rem' }}></i>
                    Mark All Read
                  </button>
                )}
                
                <button className="close-btn" onClick={onClose}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="notification-tabs">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({notifications.length})
              </button>
              <button 
                className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread ({notifications.filter(n => !n.is_read).length})
              </button>
            </div>

            <div className="notifications-list">
              {filteredNotifications.length === 0 ? (
                <div className="no-notifications">
                  <i className="fas fa-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  <p>No notifications yet</p>
                </div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      <i className={getNotificationIcon(notification.type)}></i>
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      
                      {notification.event_data && notification.event_data.events && (
                        <div className="notification-events">
                          <div className="events-summary">
                            <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem' }}></i>
                            Latest events found:
                          </div>
                          {notification.event_data.events.slice(0, 2).map((event, idx) => (
                            <div key={idx} className="event-preview">
                              <strong>{event.name}</strong>
                              {event.date && <span className="event-date"> • {event.date}</span>}
                            </div>
                          ))}
                          {notification.event_data.events.length > 2 && (
                            <div className="more-events">
                              +{notification.event_data.events.length - 2} more events
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="notification-meta">
                        <span className="source-name">{notification.url_name}</span>
                        <span className="notification-time">{formatTimeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                    
                    {!notification.is_read && (
                      <div className="unread-indicator"></div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
