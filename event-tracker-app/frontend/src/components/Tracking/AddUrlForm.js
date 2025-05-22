import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AddUrlForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    scan_interval: 10
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      new URL(formData.url);
    } catch (error) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ url: '', name: '', scan_interval: 10 });
    } catch (error) {
      console.error('Error adding URL:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="add-url-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-header">
        <h3>
          <i className="fas fa-plus-circle" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
          Add New URL to Track
        </h3>
        <p>Monitor any website for new events automatically</p>
      </div>

      <form onSubmit={handleSubmit} className="add-url-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-link" style={{ marginRight: '0.5rem' }}></i>
              Website URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/events"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-tag" style={{ marginRight: '0.5rem' }}></i>
              Display Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Company Events"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
            Scan Interval (minutes)
          </label>
          <select
            name="scan_interval"
            value={formData.scan_interval}
            onChange={handleChange}
            className="form-input"
          >
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every hour</option>
          </select>
        </div>

        <div className="form-actions">
          <motion.button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Adding...
              </>
            ) : (
              <>
                <i className="fas fa-radar" style={{ marginRight: '0.5rem' }}></i>
                Start Tracking
              </>
            )}
          </motion.button>
          
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn btn-secondary"
          >
            <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddUrlForm;
