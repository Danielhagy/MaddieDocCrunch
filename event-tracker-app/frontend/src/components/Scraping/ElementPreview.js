import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ElementPreview = ({ elements, totals, onSelectionChange, selectedElements }) => {
  const [activeTab, setActiveTab] = useState('headings');
  const [selectAll, setSelectAll] = useState({});

  const elementTypes = [
    { key: 'headings', label: 'Headings', icon: 'fas fa-heading', color: '#6366f1' },
    { key: 'paragraphs', label: 'Paragraphs', icon: 'fas fa-paragraph', color: '#ec4899' },
    { key: 'links', label: 'Links', icon: 'fas fa-link', color: '#10b981' },
    { key: 'images', label: 'Images', icon: 'fas fa-image', color: '#f59e0b' },
    { key: 'tables', label: 'Tables', icon: 'fas fa-table', color: '#8b5cf6' },
    { key: 'lists', label: 'Lists', icon: 'fas fa-list', color: '#06b6d4' },
    { key: 'divs', label: 'Divs', icon: 'fas fa-square', color: '#84cc16' }
  ];

  const handleElementToggle = (elementId) => {
    const newSelection = selectedElements.includes(elementId)
      ? selectedElements.filter(id => id !== elementId)
      : [...selectedElements, elementId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAllType = (type) => {
    const typeElements = elements[type].map(el => el.id);
    const allSelected = typeElements.every(id => selectedElements.includes(id));
    
    if (allSelected) {
      // Deselect all of this type
      const newSelection = selectedElements.filter(id => !typeElements.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Select all of this type
      const newSelection = [...new Set([...selectedElements, ...typeElements])];
      onSelectionChange(newSelection);
    }
  };

  const getElementIcon = (type) => {
    const typeConfig = elementTypes.find(t => t.key === type);
    return typeConfig?.icon || 'fas fa-code';
  };

  const getElementColor = (type) => {
    const typeConfig = elementTypes.find(t => t.key === type);
    return typeConfig?.color || '#6b7280';
  };

  return (
    <motion.div 
      className="element-preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="preview-header">
        <h3 className="preview-title">
          <i className="fas fa-eye"></i>
          Element Preview
        </h3>
        <div className="total-count">
          <span className="count-number">{totals.total}</span>
          <span className="count-label">elements found</span>
        </div>
      </div>

      <div className="element-tabs">
        {elementTypes.map((type) => (
          <motion.button
            key={type.key}
            className={`element-tab ${activeTab === type.key ? 'active' : ''}`}
            onClick={() => setActiveTab(type.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              '--tab-color': type.color,
              borderColor: activeTab === type.key ? type.color : 'transparent'
            }}
          >
            <i className={type.icon}></i>
            <span className="tab-label">{type.label}</span>
            <span className="tab-count">{totals[type.key] || 0}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="element-list"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {elements[activeTab] && elements[activeTab].length > 0 ? (
            <>
              <div className="list-header">
                <motion.button
                  className="select-all-btn"
                  onClick={() => handleSelectAllType(activeTab)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fas fa-check-square"></i>
                  {elements[activeTab].every(el => selectedElements.includes(el.id)) 
                    ? 'Deselect All' 
                    : 'Select All'
                  }
                </motion.button>
                <span className="selection-count">
                  {selectedElements.filter(id => 
                    elements[activeTab].some(el => el.id === id)
                  ).length} / {elements[activeTab].length} selected
                </span>
              </div>

              <div className="elements-grid">
                {elements[activeTab].map((element, index) => (
                  <motion.div
                    key={element.id}
                    className={`element-card ${selectedElements.includes(element.id) ? 'selected' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => handleElementToggle(element.id)}
                  >
                    <div className="element-header">
                      <div className="element-type">
                        <i 
                          className={getElementIcon(activeTab)}
                          style={{ color: getElementColor(activeTab) }}
                        ></i>
                        <span className="element-tag">{element.tag}</span>
                      </div>
                      <div className={`selection-checkbox ${selectedElements.includes(element.id) ? 'checked' : ''}`}>
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                    
                    <div className="element-content">
                      <p className="element-preview">{element.preview}</p>
                      {element.classes && (
                        <div className="element-classes">
                          <i className="fas fa-tag"></i>
                          {element.classes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-elements">
              <i className={getElementIcon(activeTab)} style={{ fontSize: '3rem', opacity: 0.3 }}></i>
              <p>No {activeTab} found on this page</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ElementPreview;
