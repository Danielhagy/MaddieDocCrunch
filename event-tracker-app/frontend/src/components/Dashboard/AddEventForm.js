import React, { useState } from 'react';

const AddEventForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    url: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <div className="form-group">
        <label className="form-label">Event Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-input"
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">URL</label>
        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-save"></i>
          Save Event
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          <i className="fas fa-times"></i>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;
