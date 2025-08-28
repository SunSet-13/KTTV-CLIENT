import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

// Import shared utilities
import { rainfallUtils, RAINFALL_COLORS } from '../../../shared/utils/rainfallUtils.js';
import { dateUtils, formatUtils } from '../../../shared/utils/index.js';

// Constants
const API_BASE_URL = 'http://localhost:2004/api/station-rain';
const API_PROVINCES_URL = 'http://localhost:2004/api/provinces';
const API_PROVINCES_BY_NAME_URL = 'http://localhost:2004/api/provinces/by-name';
const DEFAULT_CENTER = [16.0, 108.0];
const DEFAULT_ZOOM = 6;

// Provinces list
const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang'
];

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapPage({ onGoBack }) {
  // Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  
  // State
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    searchId: '',
    searchProvince: '',
    showOnlyRainy: false,
    minRainfall: 0
  });

  // Utility functions
  const isValidCoordinate = useCallback((lat, lon) => {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180 &&
           !(lat === 0 && lon === 0);
  }, []);

  const getColorForRainfall = useCallback((val) => {
    return rainfallUtils.getColorForRainfall(val);
  }, []);

  // Process API data
  const processApiData = useCallback((apiData) => {
    console.log('Processing API data:', apiData.length, 'records');
    
    const stationsMap = new Map();
    
    apiData.forEach(item => {
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      
      if (!isValidCoordinate(lat, lon)) return;
      
      const stationId = item.StationID;
      const itemDate = new Date(item.DtDate);
      
      // Keep latest record for each station
      if (!stationsMap.has(stationId) || 
          itemDate > new Date(stationsMap.get(stationId).dateTime)) {
        
        stationsMap.set(stationId, {
          id: item.StationID,
          code: item.StationNo || 'N/A',
          name: item.StationName || 'Unknown',
          latitude: lat,
          longitude: lon,
          rainValue: parseFloat(item.RainValue) || 0,
          dateTime: item.DtDate,
          province: item.Province || 'Unknown'
        });
      }
    });
    
    const stationsArray = Array.from(stationsMap.values());
    console.log('Processed stations:', stationsArray.length);
    setStations(stationsArray);
    setLoading(false);
  }, [isValidCoordinate]);

  // Create marker
  const createMarker = useCallback((station) => {
    const { latitude, longitude, rainValue, name, code, id, dateTime } = station;
    const color = getColorForRainfall(rainValue);
    const radius = rainfallUtils.getMarkerRadius(rainValue);
    
    const marker = L.circleMarker([latitude, longitude], {
      radius,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    // Popup content
    const popupContent = `
      <div style="font-family: Arial, sans-serif; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #2E86AB;">${name}</h4>
        <p style="margin: 2px 0;"><strong>Mã trạm:</strong> ${code}</p>
        <p style="margin: 2px 0;"><strong>ID:</strong> ${id}</p>
        <p style="margin: 2px 0;"><strong>Tọa độ:</strong> ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
        <p style="margin: 2px 0;"><strong>Lượng mưa:</strong> 
          <span style="color: ${color}; font-weight: bold; font-size: 16px;">${formatUtils.formatNumber(rainValue)} mm</span>
        </p>
        <p style="margin: 2px 0; font-size: 12px; color: #666;"><strong>Thời gian:</strong> ${dateUtils.formatDateTime(dateTime)}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    return marker;
  }, [getColorForRainfall]);

  // Display markers
  const displayMarkers = useCallback((stationsData) => {
    if (!mapInstance.current || !markersGroup.current) return;
    
    markersGroup.current.clearLayers();
    const bounds = [];
    
    stationsData.forEach(station => {
      const marker = createMarker(station);
      marker.addTo(markersGroup.current);
      bounds.push([station.latitude, station.longitude]);
    });
    
    // Fit bounds
    if (bounds.length > 0) {
      setTimeout(() => {
        const group = new L.featureGroup(markersGroup.current.getLayers());
        if (group.getBounds().isValid()) {
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }
      }, 200);
    }
  }, [createMarker]);

  // Load stations
  const loadStations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.stationRainData?.length > 0) {
        processApiData(data.stationRainData);
      } else {
        throw new Error('Không có dữ liệu');
      }
    } catch (error) {
      console.error('API error:', error);
      setError(`Lỗi tải dữ liệu: ${error.message}`);
      
      // Generate mock data as fallback
      const mockStations = Array.from({length: 20}, (_, i) => ({
        id: `mock_${i + 1}`,
        code: `M${String(i + 1).padStart(3, '0')}`,
        name: `Trạm mẫu ${i + 1}`,
        latitude: 10 + (Math.random() * 12),
        longitude: 105 + (Math.random() * 8),
        rainValue: Math.round(Math.random() * 50 * 10) / 10,
        dateTime: new Date().toISOString(),
        province: PROVINCES[Math.floor(Math.random() * PROVINCES.length)]
      }));
      
      setStations(mockStations);
      setLoading(false);
    }
  }, [processApiData]);

  // Load stations by province using new API
  const loadStationsByProvince = useCallback(async (provinceName) => {
    if (!provinceName) {
      loadStations();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_PROVINCES_BY_NAME_URL}?name=${encodeURIComponent(provinceName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Provinces by-name API response for', provinceName, ':', data);
      
      let provinceStations = [];
      
      // Handle different API response formats
      if (data.success && Array.isArray(data.data)) {
        provinceStations = data.data;
      } else if (Array.isArray(data)) {
        provinceStations = data;
      } else if (data.stations && Array.isArray(data.stations)) {
        provinceStations = data.stations;
      }

      // Process the stations data
      const processedStations = provinceStations.map(item => ({
        id: item.StationID || item.id,
        code: item.StationNo || item.code || 'N/A',
        name: item.StationName || item.name || 'Unknown',
        latitude: parseFloat(item.Latitude || item.latitude),
        longitude: parseFloat(item.Longitude || item.longitude),
        rainValue: parseFloat(item.RainValue || item.rainValue) || 0,
        dateTime: item.DtDate || item.dateTime || new Date().toISOString(),
        province: item.Province || item.province || provinceName
      })).filter(station => isValidCoordinate(station.latitude, station.longitude));
      
      console.log(`Loaded ${processedStations.length} stations for ${provinceName}`);
      setStations(processedStations);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading stations by province:', error);
      setError(`Không thể tải dữ liệu trạm cho ${provinceName}: ${error.message}`);
      setLoading(false);
    }
  }, [isValidCoordinate, loadStations]);

  // Filter stations
  const filteredStations = useMemo(() => {
    let filtered = stations;
    
    if (filters.searchId) {
      filtered = filtered.filter(station => 
        station.id.toString().includes(filters.searchId) ||
        station.code.toLowerCase().includes(filters.searchId.toLowerCase()) ||
        station.name.toLowerCase().includes(filters.searchId.toLowerCase())
      );
    }
    
    if (filters.searchProvince) {
      filtered = filtered.filter(station => 
        station.province === filters.searchProvince
      );
    }
    
    if (filters.showOnlyRainy) {
      filtered = filtered.filter(station => station.rainValue > 0);
    }
    
    if (filters.minRainfall > 0) {
      filtered = filtered.filter(station => station.rainValue >= filters.minRainfall);
    }
    
    return filtered;
  }, [stations, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredStations.length;
    const withRain = filteredStations.filter(s => s.rainValue > 0).length;
    const heavyRain = filteredStations.filter(s => s.rainValue > 15).length;
    
    return { total, withRain, noRain: total - withRain, heavyRain };
  }, [filteredStations]);

  // Update filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Auto-load stations when province changes
    if (key === 'searchProvince') {
      loadStationsByProvince(value);
    }
  }, [loadStationsByProvince]);

  // Effects
  useEffect(() => {
    displayMarkers(filteredStations);
  }, [filteredStations, displayMarkers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        mapInstance.current = L.map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(mapInstance.current);

        markersGroup.current = L.layerGroup().addTo(mapInstance.current);
        
        loadStations();
      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Không thể khởi tạo bản đồ');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
      }
    };
  }, [loadStations]);

  return (
    <div className="map-page">
      {/* Header */}
      <header className="map-header">
        <h1>Bản đồ Trạm Khí tượng</h1>
        <button onClick={onGoBack} className="back-button">
          ← Quay lại
        </button>
      </header>

      {/* Controls */}
      <div className="map-controls">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, mã trạm hoặc tên"
            value={filters.searchId}
            onChange={(e) => updateFilter('searchId', e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filters.searchProvince} 
            onChange={(e) => updateFilter('searchProvince', e.target.value)}
            className="province-select"
          >
            <option value="">Tất cả tỉnh thành</option>
            {PROVINCES.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showOnlyRainy}
              onChange={(e) => updateFilter('showOnlyRainy', e.target.checked)}
            />
            Chỉ hiển thị trạm có mưa
          </label>
          
          <input
            type="number"
            placeholder="Lượng mưa tối thiểu (mm)"
            value={filters.minRainfall}
            onChange={(e) => updateFilter('minRainfall', parseFloat(e.target.value) || 0)}
            className="rainfall-input"
          />
        </div>

        {/* Statistics */}
        <div className="stats">
          <span>Tổng trạm: {stats.total}</span>
          <span>Có mưa: {stats.withRain}</span>
          <span>Không mưa: {stats.noRain}</span>
          <span>Mưa to (&gt;15mm): {stats.heavyRain}</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        )}
        
        <div ref={mapRef} className="map" />
        
        {error && (
          <div className="error-overlay">
            <p>⚠️ {error}</p>
            <button onClick={loadStations} className="retry-button">
              Thử lại
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="legend">
        <h3>Chú giải lượng mưa (mm)</h3>
        <div className="legend-items">
          {RAINFALL_COLORS.map((range, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: range.color }}
              />
              <span>{range.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
