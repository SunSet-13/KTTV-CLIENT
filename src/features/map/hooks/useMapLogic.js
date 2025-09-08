import { useState, useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { MAP_CONFIG } from '../constants/mapConstants.js';
import { MapApiService } from '../services/mapApiService.js';
import { MapDataProcessor } from '../utils/mapDataProcessor.js';
import { rainfallUtils, formatUtils, dateUtils } from '../../../shared/utils/index.js';

/**
 * Custom hook for map logic and data management
 */
export const useMapLogic = () => {
  // Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  
  // State
  const [stations, setStations] = useState([]);
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

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Fix Leaflet default icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions(MAP_CONFIG.LEAFLET_ICONS);

    // Create map
    mapInstance.current = L.map(mapRef.current).setView(
      MAP_CONFIG.DEFAULT_CENTER, 
      MAP_CONFIG.DEFAULT_ZOOM
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Create markers group
    markersGroup.current = L.layerGroup().addTo(mapInstance.current);
  }, []);

  // Create marker for station
  const createMarker = useCallback((station) => {
    const { latitude, longitude, rainValue, name, code, id, dateTime } = station;
    const color = rainfallUtils.getColorForRainfall(rainValue);
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
        <p style="margin: 2px 0; font-size: 12px; color: #666;"><strong>Thời gian:</strong> ${dateUtils.formatDateTime(dateTime)}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    return marker;
  }, []);

  // Update markers on map
  const updateMarkersOnMap = useCallback((stationsData) => {
    if (!markersGroup.current) return;
    
    // Clear existing markers
    markersGroup.current.clearLayers();
    
    // Add new markers
    stationsData.forEach(station => {
      const marker = createMarker(station);
      markersGroup.current.addLayer(marker);
    });
  }, [createMarker]);

  // Load stations data
  const loadStations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await MapApiService.fetchStationRain();
      
      if (data.length > 0) {
        const processedData = MapDataProcessor.processStationRainData(data);
        setStations(processedData);
      } else {
        setError('Không có dữ liệu');
        setStations([]);
      }
    } catch (error) {
      console.error('API error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Không thể kết nối')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server backend có đang chạy?\n2. Kết nối mạng có ổn định?\n3. Port 2004 có bị block?');
      } else {
        setError(`Lỗi tải dữ liệu: ${error.message}`);
      }
      
      // Set empty data instead of keeping old data
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stations by time
  const loadStationsByTime = useCallback(async (year, month, day, hour) => {
    setLoading(true);
    setError(null);

    try {
      const data = await MapApiService.fetchRainByTime(year, month, day, hour);
      
      if (data.length > 0) {
        const processedData = MapDataProcessor.processRainTimeData(data);
        setStations(processedData);
      } else {
        setError('Không có dữ liệu cho thời gian này');
        setStations([]);
      }
    } catch (error) {
      console.error('API error:', error);
      setError(`Lỗi tải dữ liệu: ${error.message}`);
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stations by province
  const loadStationsByProvince = useCallback(async (provinceName) => {
    if (!provinceName) {
      loadStations();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await MapApiService.fetchStationsByProvince(provinceName);
      
      if (data.length > 0) {
        const processedData = MapDataProcessor.processStationRainData(data);
        setStations(processedData);
      } else {
        setError(`Không có dữ liệu cho tỉnh ${provinceName}`);
        setStations([]);
      }
    } catch (error) {
      console.error('API error:', error);
      setError(`Lỗi tải dữ liệu: ${error.message}`);
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, [loadStations]);

  // Filter handlers
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === 'province') {
      loadStationsByProvince(value);
    }
  }, [loadStationsByProvince]);

  const updateTimeSelection = useCallback((key, value) => {
    setTimeSelection(prev => ({ ...prev, [key]: parseInt(value) }));
  }, []);

  const handleLoadByTime = useCallback(() => {
    const { year, month, day, hour } = timeSelection;
    loadStationsByTime(year, month, day, hour);
  }, [timeSelection, loadStationsByTime]);

  // Sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    loadStations();
    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initializeMap, loadStations]);

  // Update markers when stations change
  useEffect(() => {
    updateMarkersOnMap(stations);
  }, [stations, updateMarkersOnMap]);

  return {
    // Refs
    mapRef,
    
    // State
    stations,
    loading,
    error,
    sidebarOpen,
    filters,
    timeSelection,
    
    // Actions
    loadStations,
    loadStationsByTime,
    loadStationsByProvince,
    updateFilter,
    updateTimeSelection,
    handleLoadByTime,
    toggleSidebar
  };
};
