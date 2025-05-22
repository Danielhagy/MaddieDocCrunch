import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="card event-card">
      <div className="card-title">{event.title}</div>
      <div className="card-content">
        <p>{event.description}</p>
        {event.date && (
          <div className="event-date">
            <i className="fas fa-calendar"></i>
            {new Date(event.date).toLocaleDateString()}
          </div>
        )}
        {event.location && (
          <div className="event-location">
            <i className="fas fa-map-marker-alt"></i>
            {event.location}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
