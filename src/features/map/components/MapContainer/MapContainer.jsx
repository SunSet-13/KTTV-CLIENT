import React from 'react';
import './MapContainer.css';

const MapContainer = ({ mapRef, loading, error, onRetry }) => {
  return (
    <main className="kttv-main">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="kttv-map" 
      />
      
      {error && (
        <div className="error-overlay">
          <p>⚠️ {error}</p>
          <button onClick={onRetry} className="retry-button">
            Thử lại
          </button>
        </div>
      )}
    </main>
  );
};

export default MapContainer;
