import React, { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';

// Import components
import MapFilters from '../components/MapFilters';
import MapContainer from '../components/MapContainer';
import ProvinceStats from '../components/ProvinceStats';

// Import hooks
import { useStations, useProvinces } from '../hooks/useMapData';

// Import styles
import './MapPageKTTV.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = [16.0, 108.0];
const DEFAULT_ZOOM = 6;

function MapPageKTTV_Refactored({ onGoBack }) {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    dataType: 'rainfall',
    province: '',
    selectedDate: new Date().toISOString().split('T')[0],
    timeRange: 'all'
  });

  // Custom hooks
  const {
    stations,
    filteredStations,
    loading: stationsLoading,
    error: stationsError,
    updateFilter,
    loadStations,
    retry: retryStations
  } = useStations(filters);

  const {
    provinces,
    provinceStats,
    loading: provincesLoading,
    error: provincesError
  } = useProvinces();

  // Load initial data
  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    // Update individual filters in the hook
    Object.entries(newFilters).forEach(([key, value]) => {
      if (filters[key] !== value) {
        updateFilter(key, value);
      }
    });
  }, [filters, updateFilter]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (filters.province) {
      updateFilter('province', filters.province); // This will trigger reload
    } else {
      loadStations();
    }
  }, [filters.province, loadStations, updateFilter]);

  // Handle sidebar toggle
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Handle map ready
  const handleMapReady = useCallback((map) => {
    setMapInstance(map);
  }, []);

  // Calculate loading state
  const isLoading = stationsLoading || provincesLoading;

  // Calculate error state
  const hasError = stationsError || provincesError;
  const errorMessage = stationsError || provincesError;

  // Get current province stats
  const currentProvinceStats = filters.province 
    ? provinceStats[filters.province] 
    : null;

  return (
    <div className="map-page-kttv">
      {/* Filters Section */}
      <MapFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onGoBack={onGoBack}
        loading={isLoading}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className={`map-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="left-sidebar">
            {/* Province Statistics */}
            {filters.province && (
              <ProvinceStats
                selectedProvince={filters.province}
                provinceStats={provinceStats}
                loading={provincesLoading}
              />
            )}

            {/* Error Display */}
            {hasError && (
              <div className="error-panel">
                <h4>⚠️ Lỗi tải dữ liệu</h4>
                <p>{errorMessage}</p>
                <button 
                  className="retry-button" 
                  onClick={retryStations}
                >
                  🔄 Thử lại
                </button>
              </div>
            )}

            {/* Stations Summary */}
            {!hasError && (
              <div className="stations-summary">
                <h4>📡 Tổng quan trạm</h4>
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="summary-label">Tổng số trạm:</span>
                    <span className="summary-value">{filteredStations.length}</span>
                  </div>
                  {filters.province && (
                    <div className="summary-item">
                      <span className="summary-label">Tỉnh/Thành:</span>
                      <span className="summary-value">{filters.province}</span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="summary-label">Ngày:</span>
                    <span className="summary-value">{filters.selectedDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Area */}
        <div className="map-area">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu bản đồ...</p>
              </div>
            </div>
          )}

          <MapContainer
            stations={filteredStations}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            onMapReady={handleMapReady}
            showLegend={true}
          />
        </div>
      </div>
    </div>
  );
}

export default MapPageKTTV_Refactored;
