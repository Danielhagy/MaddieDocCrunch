import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const DownloadPanel = ({ url, selectedElements, onDownloadComplete }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (selectedElements.length === 0) {
      toast.error('Please select at least one element to download');
      return;
    }

    setDownloading(true);
    
    try {
      const response = await api.post('/scraping/extract', {
        url,
        selectedElements
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
      link.download = `documentcrunch_scraped_data_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Successfully downloaded ${selectedElements.length} elements!`);
      onDownloadComplete && onDownloadComplete();
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div 
      className="download-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="download-header">
        <h3 className="download-title">
          <i className="fas fa-download"></i>
          Export Data
        </h3>
        <p className="download-subtitle">
          Download selected elements as an Excel file
        </p>
      </div>

      <div className="download-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{selectedElements.length}</span>
            <span className="stat-label">Elements Selected</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Excel</span>
            <span className="stat-label">File Format</span>
          </div>
        </div>
        
        {selectedElements.length > 0 && (
          <div className="selected-preview">
            <p className="preview-label">Selected Elements:</p>
            <div className="preview-tags">
              {selectedElements.slice(0, 5).map((elementId, index) => (
                <span key={index} className="preview-tag">
                  {elementId.replace('_', ' ').toUpperCase()}
                </span>
              ))}
              {selectedElements.length > 5 && (
                <span className="preview-tag more">
                  +{selectedElements.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <motion.button
        className={`download-btn ${selectedElements.length === 0 ? 'disabled' : ''}`}
        onClick={handleDownload}
        disabled={downloading || selectedElements.length === 0}
        whileHover={selectedElements.length > 0 ? { scale: 1.02 } : {}}
        whileTap={selectedElements.length > 0 ? { scale: 0.98 } : {}}
      >
        {downloading ? (
          <>
            <div className="spinner"></div>
            Generating Excel...
          </>
        ) : (
          <>
            <i className="fas fa-file-excel"></i>
            Download Excel File
          </>
        )}
      </motion.button>

      {selectedElements.length === 0 && (
        <p className="no-selection-message">
          <i className="fas fa-info-circle"></i>
          Select elements above to enable download
        </p>
      )}
    </motion.div>
  );
};

export default DownloadPanel;
