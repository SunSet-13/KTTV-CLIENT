import React from 'react';
import 'leaflet/dist/leaflet.css';
import './MapPageKTTV.css';

// Import các modules đã tách
import { useMapLogic } from '../hooks/useMapLogic.js';
import MapFilters from '../components/MapFilters';
import MapContainer from '../components/MapContainer';
import MapLegend from '../components/MapLegend';
import { RAINFALL_COLORS } from '../../../shared/utils/rainfallUtils.js';
import { MapDataProcessor } from '../utils/mapDataProcessor.js';
import ApiErrorBoundary from '../../../components/ApiErrorBoundary.jsx';

function MapPageKTTV_Modular() {
  // Sử dụng custom hook cho toàn bộ logic
  const {
    mapRef,
    stations,
    loading,
    error,
    sidebarOpen,
    filters,
    timeSelection,
    loadStations,
    updateFilter,
    updateTimeSelection,
    handleLoadByTime
  } = useMapLogic();

  // Tính toán stats cho legend
  const stats = MapDataProcessor.calculateStats(stations, RAINFALL_COLORS);

  return (
    <div className="kttv-map-page">
      {/* Main Content */}
      <div className="kttv-content">
        {/* Sidebar với Filters */}
        <aside className={`kttv-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2><i className="fas fa-filter"></i> Bộ lọc dữ liệu</h2>
            </div>
            
            <MapFilters
              filters={filters}
              timeSelection={timeSelection}
              loading={loading}
              updateFilter={updateFilter}
              updateTimeSelection={updateTimeSelection}
              handleLoadByTime={handleLoadByTime}
            />
          </div>
        </aside>

        {/* Map Container */}
        <MapContainer
          mapRef={mapRef}
          loading={loading}
          error={error}
          onRetry={loadStations}
        />

        {/* Legend Panel */}
        <aside className="kttv-legend">
          <MapLegend stations={stations} />
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="kttv-status">
        <div className="status-info">
          <span className="status-item">
            <i className="fas fa-broadcast-tower"></i>
            Tổng trạm: <strong>{stats.total}</strong>
          </span>
          <span className="status-item">
            <i className="fas fa-cloud-rain"></i>
            Có mưa: <strong>{stats.withRain}</strong>
          </span>
          <span className="status-item">
            <i className="fas fa-clock"></i>
            Cập nhật: <strong>{new Date().toLocaleTimeString('vi-VN')}</strong>
          </span>
        </div>
        
        <div className="status-controls">
          <button className="status-btn">
            <i className="fas fa-download"></i>
            Xuất dữ liệu
          </button>
          <button className="status-btn">
            <i className="fas fa-share"></i>
            Chia sẻ
          </button>
        </div>
      </footer>
    </div>
  );
}

export default MapPageKTTV_Modular;
