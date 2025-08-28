import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPageKTTV.css';

// Import from shared utilities and services
import { rainfallUtils, RAINFALL_COLORS } from '../../../shared/utils/rainfallUtils.js';
import { dateUtils, formatUtils } from '../../../shared/utils/index.js';

// Constants from shared utilities
const API_BASE_URL = 'http://localhost:2004/api/station-rain';
const API_RAIN_TIME_URL = 'http://localhost:2004/api/rain-time';
const API_PROVINCES_URL = 'http://localhost:2004/api/provinces';
const API_PROVINCES_BY_NAME_URL = 'http://localhost:2004/api/provinces/by-name';
const DEFAULT_CENTER = [16.0, 108.0];
const DEFAULT_ZOOM = 6;

// Provinces data
const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapPageKTTV({ onGoBack }) {
  // Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  
  // State
  const [stations, setStations] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [provinceStats, setProvinceStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    dataType: 'rainfall',
    province: '',
    selectedDate: new Date().toISOString().split('T')[0],
    timeRange: 'all'
  });

  // Time selection states for rain-time API
  const [timeSelection, setTimeSelection] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours()
  });

  // Utility functions using shared utilities
  const getColorForRainfall = useCallback((val) => {
    return rainfallUtils.getColorForRainfall(val);
  }, []);

  const isValidCoordinate = useCallback((lat, lon) => {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180 &&
           !(lat === 0 && lon === 0);
  }, []);

  const formatDateTime = useCallback((dateStr) => {
    return dateUtils.formatDateTime(dateStr);
  }, []);

  // Data processing
  const processApiData = useCallback((apiData) => {
    const stationsMap = new Map();
    
    apiData.forEach(item => {
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      
      if (!isValidCoordinate(lat, lon)) return;
      
      const stationId = item.StationID;
      const itemDate = new Date(item.DtDate);
      
      // Keep the latest record for each station
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
    setStations(stationsArray);
    setLoading(false);
  }, [isValidCoordinate]);

  // Data processing for rain-time API (different structure)
  const processRainTimeData = useCallback((apiData) => {
    const stationsMap = new Map();
    
    apiData.forEach(item => {
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      
      if (!isValidCoordinate(lat, lon)) return;
      
      // Use StationName as ID since rain-time API doesn't have StationID
      const stationId = item.StationName || item.StationNameVN;
      const itemDate = new Date(item.DateTime);
      
      // Keep the latest record for each station
      if (!stationsMap.has(stationId) || 
          itemDate > new Date(stationsMap.get(stationId).dateTime)) {
        
        stationsMap.set(stationId, {
          id: stationId,
          code: item.StationName || 'N/A',
          name: item.StationNameVN || item.StationName || 'Unknown',
          latitude: lat,
          longitude: lon,
          rainValue: parseFloat(item.Value) || 0,
          dateTime: item.DateTime,
          province: 'N/A' // rain-time API doesn't provide province
        });
      }
    });
    
    const stationsArray = Array.from(stationsMap.values());
    setStations(stationsArray);
    setLoading(false);
  }, [isValidCoordinate]);

  // Map functions
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

    // Hover effects
    marker.on('mouseover', () => marker.setStyle({ 
      fillOpacity: 1, weight: 3, radius: radius + 1 
    }));
    
    marker.on('mouseout', () => marker.setStyle({ 
      fillOpacity: 0.8, weight: 2, radius 
    }));
    
    // Popup
    const popupContent = `
      <div style="font-family: Arial, sans-serif; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #2E86AB;">${name}</h4>
        <p style="margin: 2px 0;"><strong>Mã trạm:</strong> ${code}</p>
        <p style="margin: 2px 0;"><strong>ID:</strong> ${id}</p>
        <p style="margin: 2px 0;"><strong>Tọa độ:</strong> ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
        <p style="margin: 2px 0;"><strong>Lượng mưa:</strong> 
          <span style="color: ${color}; font-weight: bold; font-size: 16px;">${formatUtils.formatNumber(rainValue)} mm</span>
        </p>
        <p style="margin: 2px 0; font-size: 12px; color: #666;"><strong>Thời gian:</strong> ${formatDateTime(dateTime)}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    return marker;
  }, [getColorForRainfall, formatDateTime]);

  const displayMarkers = useCallback((stationsData) => {
    if (!mapInstance.current || !markersGroup.current) return;
    
    markersGroup.current.clearLayers();
    const bounds = [];
    
    stationsData.forEach(station => {
      const marker = createMarker(station);
      marker.addTo(markersGroup.current);
      bounds.push([station.latitude, station.longitude]);
    });
    
    // Fit bounds or set default view
    if (bounds.length > 0) {
      setTimeout(() => {
        const group = new L.featureGroup(markersGroup.current.getLayers());
        if (group.getBounds().isValid()) {
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        } else {
          mapInstance.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        }
      }, 200);
    } else {
      mapInstance.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [createMarker]);

  // API call
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
        setError('Không có dữ liệu');
        setStations([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('API error:', error);
      setError(`Lỗi tải dữ liệu: ${error.message}`);
      setStations([]);
      setLoading(false);
    }
  }, [processApiData]);

  // API call for rain-time with specific time
  const loadStationsByTime = useCallback(async (year, month, day, hour) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_RAIN_TIME_URL}?year=${year}&month=${month}&day=${day}&hour=${hour}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.data?.length > 0) {
        processRainTimeData(data.data);
      } else {
        setError('Không có dữ liệu cho thời gian này');
        setStations([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('API error:', error);
      setError(`Lỗi tải dữ liệu: ${error.message}`);
      setStations([]);
      setLoading(false);
    }
  }, [processRainTimeData]);

  // Load provinces list
  const loadProvinces = useCallback(async () => {
    try {
      // Use the correct API endpoint
      const response = await fetch(`${API_PROVINCES_URL}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle API response format: {success: true, data: [...], count: number}
      if (data.success && Array.isArray(data.data)) {
        const provinceNames = data.data.map(item => item.ProvinceName).filter(Boolean);
        setProvinces(provinceNames);
      } else if (Array.isArray(data)) {
        // If data is array of provinces
        const provinceNames = data.map(item => item.ProvinceName || item.name || item).filter(Boolean);
        setProvinces(provinceNames);
      } else {
        // Fallback to default provinces
        setProvinces(PROVINCES);
      }
    } catch (error) {
      console.error('Provinces API error:', error);
      // Fallback to default provinces list
      setProvinces(PROVINCES);
    }
  }, []);



  // Load province statistics  
  const loadProvinceStats = useCallback(async () => {
    // Không load tất cả tỉnh nữa, chỉ để empty object
    setProvinceStats({});
  }, []);

  // Load stats cho tỉnh cụ thể khi user chọn
  const loadStatsForProvince = useCallback(async (provinceName) => {
    if (!provinceName || provinceStats[provinceName]) {
      return; // Đã có stats hoặc không có tỉnh
    }

    try {
      const response = await fetch(`${API_PROVINCES_BY_NAME_URL}?name=${encodeURIComponent(provinceName)}`);
      
      if (response.ok) {
        const data = await response.json();
        const stationCount = data.success && Array.isArray(data.data) ? data.data.length : 0;
        
        // Cập nhật stats cho tỉnh này
        setProvinceStats(prev => ({
          ...prev,
          [provinceName]: {
            totalStations: stationCount,
            activeStations: stationCount,
            averageRainfall: 0
          }
        }));
      }
    } catch (error) {
      console.error(`❌ Error loading stats for ${provinceName}:`, error);
    }
  }, [provinceStats]);

  // Load stations by province
  const loadStationsByProvince = useCallback(async (provinceName) => {
    if (!provinceName) {
      loadStations();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sử dụng API mới /api/provinces/by-name với query parameter
      const response = await fetch(`${API_PROVINCES_BY_NAME_URL}?name=${encodeURIComponent(provinceName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      let provinceStations = [];
      
      // Xử lý dữ liệu từ API provinces/by-name
      if (data.success && Array.isArray(data.data)) {
        // API trả về { success: true, data: [...] }
        provinceStations = data.data.map(item => ({
          id: item.StationID || item.id,
          code: item.StationNo || item.code || 'N/A',
          name: item.StationNameVN || item.StationName || item.name || 'Unknown',
          latitude: parseFloat(item.Latitude || item.latitude || 0),
          longitude: parseFloat(item.Longitude || item.longitude || 0),
          rainValue: parseFloat(item.LatestRainValue || item.RainValue || item.rainValue || 0),
          dateTime: item.LatestRainDateTime || item.DtDate || item.dateTime || new Date().toISOString(),
          province: provinceName
        }));
      } else if (Array.isArray(data)) {
        // API trả về array trực tiếp
        provinceStations = data.map(item => ({
          id: item.StationID || item.id,
          code: item.StationNo || item.code || 'N/A',
          name: item.StationNameVN || item.StationName || item.name || 'Unknown',
          latitude: parseFloat(item.Latitude || item.latitude || 0),
          longitude: parseFloat(item.Longitude || item.longitude || 0),
          rainValue: parseFloat(item.LatestRainValue || item.RainValue || item.rainValue || 0),
          dateTime: item.LatestRainDateTime || item.DtDate || item.dateTime || new Date().toISOString(),
          province: provinceName
        }));
      } else if (data.stations && Array.isArray(data.stations)) {
        // Trường hợp API trả về { stations: [...] }
        provinceStations = data.stations.map(item => ({
          id: item.StationID || item.id,
          code: item.StationNo || item.code || 'N/A',
          name: item.StationNameVN || item.StationName || item.name || 'Unknown',
          latitude: parseFloat(item.Latitude || item.latitude || 0),
          longitude: parseFloat(item.Longitude || item.longitude || 0),
          rainValue: parseFloat(item.LatestRainValue || item.RainValue || item.rainValue || 0),
          dateTime: item.LatestRainDateTime || item.DtDate || item.dateTime || new Date().toISOString(),
          province: provinceName
        }));
      }

      // Lọc các trạm có tọa độ hợp lệ
      const validStations = provinceStations.filter(station => 
        isValidCoordinate(station.latitude, station.longitude)
      );

      if (validStations.length === 0) {
        // Không có trạm từ API
        setStations([]);
        displayMarkers([]);
        setLoading(false);
      } else {
        setStations(validStations);
        displayMarkers(validStations);
        setLoading(false);
        
        // Focus map vào vùng có trạm
        if (validStations.length > 0) {
          setTimeout(() => {
            const bounds = validStations.map(station => [station.latitude, station.longitude]);
            if (bounds.length > 0 && mapInstance.current) {
              const group = new L.featureGroup(markersGroup.current.getLayers());
              if (group.getBounds().isValid()) {
                mapInstance.current.fitBounds(group.getBounds().pad(0.1));
              }
            }
          }, 300);
        }
      }

    } catch (error) {
      console.error('Error loading stations by province:', error);
      setError(`Không thể tải dữ liệu trạm cho ${provinceName}: ${error.message}`);
      setStations([]);
      displayMarkers([]);
      setLoading(false);
    }
  }, [isValidCoordinate, displayMarkers, loadStations]);

  // Filter functions
  const filteredStations = useMemo(() => {
    let filtered = stations;
    
    // Filter by province
    if (filters.province) {
      filtered = filtered.filter(station => 
        station.province === filters.province
      );
    }
    
    return filtered;
  }, [stations, filters]);

  // Computed statistics
  const stats = useMemo(() => {
    const total = filteredStations.length;
    const withRain = filteredStations.filter(s => s.rainValue > 0).length;
    const noRain = total - withRain;
    const heavyRain = filteredStations.filter(s => s.rainValue > 15).length;
    
    // Group by rainfall ranges
    const ranges = {};
    RAINFALL_COLORS.forEach(range => {
      ranges[range.label] = filteredStations.filter(s => 
        s.rainValue >= range.min && s.rainValue <= range.max
      ).length;
    });
    
    return { total, withRain, noRain, heavyRain, ranges };
  }, [filteredStations]);

  // Event handlers
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Auto-load stations when province changes
    if (key === 'province') {
      loadStationsByProvince(value);
      // Load stats cho tỉnh được chọn
      if (value) {
        loadStatsForProvince(value);
      }
    }
  }, [loadStationsByProvince, loadStatsForProvince]);

  const updateTimeSelection = useCallback((key, value) => {
    setTimeSelection(prev => ({ ...prev, [key]: parseInt(value) }));
  }, []);

  const handleLoadByTime = useCallback(() => {
    const { year, month, day, hour } = timeSelection;
    loadStationsByTime(year, month, day, hour);
  }, [timeSelection, loadStationsByTime]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(mapInstance.current);

        markersGroup.current = L.layerGroup().addTo(mapInstance.current);
        
        // Load initial data
        loadStations();
        loadProvinces();
        loadProvinceStats();
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
  }, [loadStations, loadProvinces, loadProvinceStats]);

  return (
    <div className="kttv-map-page">
      {/* Header */}
      <header className="kttv-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-placeholder">🌦️</div>
            <div className="title-section">
              <h1>TRUNG TÂM</h1>
              <p>THÔNG TIN VÀ DỮ LIỆU KHÍ TƯỢNG THỦY VĂN</p>
            </div>
          </div>
        </div>
        <nav className="header-nav">
          <a href="#" className="nav-item active">Trang chủ</a>
          <a href="#" className="nav-item">Dữ liệu</a>
          <a href="#" className="nav-item">Bản đồ</a>
          <a href="#" className="nav-item">Tìm kiếm</a>
          <a href="#" className="nav-item">Hướng dẫn</a>
          <a href="#" className="nav-item">Liên hệ</a>
        </nav>
      </header>

      <div className="kttv-content">
        {/* Sidebar */}
        <aside className={`kttv-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
            {sidebarOpen && ' Bộ Lọc Menu'}
          </button>

          {sidebarOpen && (
            <div className="sidebar-content">
              {/* Data Type Filter */}
              <div className="filter-section">
                <h3><i className="fas fa-layer-group"></i> Loại dữ liệu</h3>
                <div className="filter-options">
                  <label className={`option-card ${filters.dataType === 'rainfall' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="dataType"
                      value="rainfall"
                      checked={filters.dataType === 'rainfall'}
                      onChange={(e) => updateFilter('dataType', e.target.value)}
                    />
                    <i className="fas fa-cloud-rain"></i>
                    <span>Lượng mưa</span>
                  </label>
                  <label className={`option-card ${filters.dataType === 'temperature' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="dataType"
                      value="temperature"
                      checked={filters.dataType === 'temperature'}
                      onChange={(e) => updateFilter('dataType', e.target.value)}
                    />
                    <i className="fas fa-thermometer-half"></i>
                    <span>Nhiệt độ</span>
                  </label>
                  <label className={`option-card ${filters.dataType === 'wind' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="dataType"
                      value="wind"
                      checked={filters.dataType === 'wind'}
                      onChange={(e) => updateFilter('dataType', e.target.value)}
                    />
                    <i className="fas fa-wind"></i>
                    <span>Gió</span>
                  </label>
                  <label className={`option-card ${filters.dataType === 'humidity' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="dataType"
                      value="humidity"
                      checked={filters.dataType === 'humidity'}
                      onChange={(e) => updateFilter('dataType', e.target.value)}
                    />
                    <i className="fas fa-tint"></i>
                    <span>Độ ẩm</span>
                  </label>
                  <label className={`option-card ${filters.dataType === 'pressure' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="dataType"
                      value="pressure"
                      checked={filters.dataType === 'pressure'}
                      onChange={(e) => updateFilter('dataType', e.target.value)}
                    />
                    <i className="fas fa-gauge"></i>
                    <span>Áp suất</span>
                  </label>
                </div>
              </div>

              {/* Province Filter */}
              <div className="filter-section">
                <h3><i className="fas fa-map-marker-alt"></i> Tỉnh</h3>
                <select 
                  value={filters.province} 
                  onChange={(e) => updateFilter('province', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả tỉnh thành</option>
                  {Array.isArray(provinces) && provinces.map(province => {
                    const provinceName = typeof province === 'string' ? province : province.name || province;
                    const stationInfo = provinceStats[provinceName];
                    const stationCount = stationInfo ? stationInfo.totalStations : null;
                    return (
                      <option key={provinceName} value={provinceName}>
                        {provinceName}{stationCount !== null ? ` (${stationCount} trạm)` : ''}
                      </option>
                    );
                  })}
                </select>
                
                {filters.province && (
                  <div className="province-info">
                    <small>
                      <i className="fas fa-info-circle"></i>
                      {loading ? 
                        `Đang tải dữ liệu cho ${filters.province}...` :
                        `${stats.total} trạm trong ${filters.province}`
                      }
                    </small>
                  </div>
                )}
              </div>

              {/* Time Filter */}
              <div className="filter-section">
                <h3><i className="fas fa-calendar"></i> Thời gian</h3>
                <input
                  type="date"
                  value={filters.selectedDate}
                  onChange={(e) => updateFilter('selectedDate', e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Specific Time Selection for Rain-Time API */}
              <div className="filter-section">
                <h3><i className="fas fa-clock"></i> Tìm kiếm theo thời gian cụ thể</h3>
                <div className="time-inputs">
                  <div className="input-group">
                    <label>Năm:</label>
                    <input
                      type="number"
                      value={timeSelection.year}
                      onChange={(e) => updateTimeSelection('year', e.target.value)}
                      min="2020"
                      max="2030"
                      className="time-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Tháng:</label>
                    <input
                      type="number"
                      value={timeSelection.month}
                      onChange={(e) => updateTimeSelection('month', e.target.value)}
                      min="1"
                      max="12"
                      className="time-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Ngày:</label>
                    <input
                      type="number"
                      value={timeSelection.day}
                      onChange={(e) => updateTimeSelection('day', e.target.value)}
                      min="1"
                      max="31"
                      className="time-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Giờ:</label>
                    <input
                      type="number"
                      value={timeSelection.hour}
                      onChange={(e) => updateTimeSelection('hour', e.target.value)}
                      min="0"
                      max="23"
                      className="time-input"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleLoadByTime}
                  className="load-time-button"
                  disabled={loading}
                >
                  <i className="fas fa-search"></i>
                  {loading ? 'Đang tải...' : 'Tải dữ liệu theo thời gian'}
                </button>
              </div>

              {/* Time Range Filter */}
              <div className="filter-section">
                <h3><i className="fas fa-clock"></i> Bộ lọc Giờ</h3>
                <div className="time-filter-buttons">
                  {[
                    { value: 'night', label: 'Đêm (0-6h)', icon: 'fa-moon' },
                    { value: 'morning', label: 'Sáng (6-12h)', icon: 'fa-sun' },
                    { value: 'afternoon', label: 'Chiều (12-18h)', icon: 'fa-sun' },
                    { value: 'evening', label: 'Tối (18-24h)', icon: 'fa-moon' }
                  ].map(time => (
                    <button
                      key={time.value}
                      className={`time-button ${filters.timeRange === time.value ? 'active' : ''}`}
                      onClick={() => updateFilter('timeRange', time.value)}
                    >
                      <i className={`fas ${time.icon}`}></i>
                      {time.label}
                    </button>
                  ))}
                  <button
                    className={`time-button ${filters.timeRange === 'all' ? 'active' : ''}`}
                    onClick={() => updateFilter('timeRange', 'all')}
                  >
                    <i className="fas fa-clock"></i>
                    Tất cả giờ
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Map */}
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
              <button onClick={loadStations} className="retry-button">
                Thử lại
              </button>
            </div>
          )}
        </main>

        {/* Legend Panel */}
        <aside className="kttv-legend">
          <div className="legend-content">
            <div className="legend-header">
              <h3><i className="fas fa-palette"></i> Chú giải lượng mưa (mm)</h3>
              <button className="collapse-btn">⌄</button>
            </div>
            
            <div className="legend-scale">
              {RAINFALL_COLORS.map((range, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="legend-label">{range.label}</span>
                  <span className="legend-count">
                    {stats.ranges[range.label] || 0}
                  </span>
                </div>
              ))}
            </div>

            <div className="legend-stats">
              <h4><i className="fas fa-chart-bar"></i> Thống kê</h4>
              <div className="stat-item">
                <span className="stat-label">Tổng trạm:</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Có mưa:</span>
                <span className="stat-value">{stats.withRain}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Không mưa:</span>
                <span className="stat-value">{stats.noRain}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mưa vừa (5-15mm):</span>
                <span className="stat-value">{stats.ranges['5-15 mm'] || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mưa khá (15-25mm):</span>
                <span className="stat-value">{stats.ranges['15-25 mm'] || 0}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Back Button */}
      {onGoBack && (
        <button className="back-to-app" onClick={onGoBack}>
          ← Quay lại ứng dụng chính
        </button>
      )}
    </div>
  );
}

export default MapPageKTTV;
