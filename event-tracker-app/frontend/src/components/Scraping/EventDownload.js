import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const EventDownload = ({ url, selectedEvents, onDownloadComplete }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event to download');
      return;
    }

    setDownloading(true);
    
    try {
      const response = await api.post('/scraping/extract', {
        url,
        selectedEvents
      }, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `Events_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(
        <>
          <i className="fas fa-party-horn" style={{ marginRight: '0.5rem' }}></i>
          Downloaded {selectedEvents.length} events to Excel!
        </>
      );
      onDownloadComplete && onDownloadComplete();
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to create Excel file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div 
      className="download-events"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="download-header">
        <h3>
          <i className="fas fa-download" style={{ color: '#10b981', marginRight: '0.5rem' }}></i>
          Download Your Events
        </h3>
        <p>Save selected events to an Excel spreadsheet</p>
      </div>

      <div className="download-summary">
        <div className="download-stats">
          <div className="download-stat">
            <span className="stat-number">{selectedEvents.length}</span>
            <span className="stat-label">
              <i className="fas fa-calendar-check" style={{ marginRight: '0.25rem' }}></i>
              Events Selected
            </span>
          </div>
          <div className="download-stat">
            <span className="stat-number">
              <i className="fas fa-file-excel" style={{ color: '#10b981' }}></i>
            </span>
            <span className="stat-label">Excel Format</span>
          </div>
        </div>
        
        {selectedEvents.length > 0 && (
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginTop: '1rem' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem', color: '#6366f1' }}></i>
            Your Excel file will include: Event Name, Date, Time, Description, Location, and Website URL
          </p>
        )}
      </div>

      <motion.button
        className={`download-excel-btn ${selectedEvents.length === 0 ? 'disabled' : ''}`}
        onClick={handleDownload}
        disabled={downloading || selectedEvents.length === 0}
        whileHover={selectedEvents.length > 0 ? { scale: 1.02 } : {}}
        whileTap={selectedEvents.length > 0 ? { scale: 0.98 } : {}}
      >
        {downloading ? (
          <>
            <div className="btn-spinner"></div>
            Creating Excel File...
          </>
        ) : (
          <>
            <i className="fas fa-file-excel" style={{ marginRight: '0.5rem' }}></i>
            Download Excel File
          </>
        )}
      </motion.button>

      {selectedEvents.length === 0 && (
        <p className="no-selection-msg">
          <i className="fas fa-hand-pointer" style={{ marginRight: '0.5rem', color: '#f59e0b' }}></i>
          Select some events above to download them
        </p>
      )}
    </motion.div>
  );
};

export default EventDownload;
