import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const UrlInput = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL to analyze');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
      onAnalyze(url);
    } catch (error) {
      toast.error('Please enter a valid URL (include http:// or https://)');
    }
  };

  const handleQuickFill = (exampleUrl) => {
    setUrl(exampleUrl);
  };

  return (
    <motion.div 
      className="url-input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="input-header">
        <h2 className="input-title">
          <i className="fas fa-globe"></i>
          Website URL Analysis
        </h2>
        <p className="input-subtitle">
          Enter a website URL to discover all scrapable elements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="url-form">
        <div className="url-input-group">
          <div className="input-with-icon">
            <i className="fas fa-link input-icon"></i>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="url-input"
              disabled={loading}
            />
          </div>
          <motion.button
            type="submit"
            className="analyze-btn"
            disabled={loading || !url.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i>
                Analyze Site
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="quick-examples">
        <p className="examples-label">Quick Examples:</p>
        <div className="example-buttons">
          {[
            'https://example.com',
            'https://news.ycombinator.com',
            'https://httpbin.org/html'
          ].map((exampleUrl, index) => (
            <motion.button
              key={index}
              className="example-btn"
              onClick={() => handleQuickFill(exampleUrl)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {exampleUrl.replace('https://', '')}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UrlInput;
