import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import UrlInput from '../components/Scraping/UrlInput';
import ElementPreview from '../components/Scraping/ElementPreview';
import DownloadPanel from '../components/Scraping/DownloadPanel';
import api from '../utils/api';
import '../styles/scraping.css';

const ScrapingDashboard = () => {
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    document.title = 'Web Scraping - DocumentCrunch Event Hub';
  }, []);

  const handleAnalyzeUrl = async (url) => {
    setLoading(true);
    setAnalysisData(null);
    setSelectedElements([]);
    setCurrentUrl(url);

    try {
      toast.loading('Analyzing website...', { id: 'analyze' });
      
      const response = await api.post('/scraping/analyze', { url });
      
      setAnalysisData(response.data);
      toast.success(`Found ${response.data.totals.total} elements!`, { id: 'analyze' });
      
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to analyze website';
      toast.error(errorMessage, { id: 'analyze' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedElements(newSelection);
  };

  const handleDownloadComplete = () => {
    console.log('Download completed for:', currentUrl);
  };

  const handleReset = () => {
    setAnalysisData(null);
    setSelectedElements([]);
    setCurrentUrl('');
  };

  return (
    <div className="scraping-dashboard fade-in">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)'
          }
        }}
      />

      <div className="dashboard-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">
            <i className="fas fa-spider"></i>
            DocumentCrunch Web Scraper
          </h1>
          <p className="page-subtitle">
            Maddie's team tool for extracting structured data from any website
          </p>
        </motion.div>

        {analysisData && (
          <motion.button
            className="reset-btn"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <i className="fas fa-refresh"></i>
            New Analysis
          </motion.button>
        )}
      </div>

      <div className="scraping-workflow">
        <UrlInput 
          onAnalyze={handleAnalyzeUrl}
          loading={loading}
        />

        {analysisData && (
          <>
            <motion.div 
              className="analysis-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="success-content">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h3>Analysis Complete!</h3>
                  <p>Found {analysisData.totals.total} scrapable elements from <strong>{analysisData.url}</strong></p>
                </div>
              </div>
            </motion.div>

            <ElementPreview
              elements={analysisData.elements}
              totals={analysisData.totals}
              onSelectionChange={handleSelectionChange}
              selectedElements={selectedElements}
            />

            <DownloadPanel
              url={currentUrl}
              selectedElements={selectedElements}
              onDownloadComplete={handleDownloadComplete}
            />
          </>
        )}

        {!analysisData && !loading && (
          <motion.div 
            className="getting-started"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="workflow-steps">
              <h3>How it works:</h3>
              <div className="steps-grid">
                <div className="step-item">
                  <div className="step-icon">
                    <i className="fas fa-link"></i>
                  </div>
                  <h4>1. Enter URL</h4>
                  <p>Input any website URL to analyze</p>
                </div>
                <div className="step-item">
                  <div className="step-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h4>2. Discover Elements</h4>
                  <p>We'll find all scrapable content</p>
                </div>
                <div className="step-item">
                  <div className="step-icon">
                    <i className="fas fa-mouse-pointer"></i>
                  </div>
                  <h4>3. Select Data</h4>
                  <p>Choose which elements to extract</p>
                </div>
                <div className="step-item">
                  <div className="step-icon">
                    <i className="fas fa-download"></i>
                  </div>
                  <h4>4. Download Excel</h4>
                  <p>Get structured data instantly</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScrapingDashboard;
