import { useState, useEffect, useCallback } from 'react';
import { stationService, provinceService } from '../../../shared/services/dataService.js';
import { dataUtils, errorUtils } from '../../../shared/utils/index.js';

// Hook for managing station data
export const useStations = (initialFilters = {}) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Load all stations
  const loadStations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiData = await stationService.getAllStations();
      const processedStations = dataUtils.processStationData(apiData);
      setStations(processedStations);
    } catch (error) {
      const errorMessage = errorUtils.handleApiError(error);
      setError(errorMessage);
      errorUtils.logError(error, 'loadStations');
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
      const data = await stationService.getStationsByProvince(provinceName);
      const processedStations = data.map(item => ({
        id: item.StationID || item.id,
        code: item.StationNo || item.code || 'N/A',
        name: item.StationName || item.name || 'Unknown',
        latitude: parseFloat(item.Latitude || item.latitude),
        longitude: parseFloat(item.Longitude || item.longitude),
        rainValue: parseFloat(item.RainValue || item.rainValue) || 0,
        dateTime: item.DtDate || item.dateTime || new Date().toISOString(),
        province: item.Province || item.province || provinceName
      })).filter(station => 
        !isNaN(station.latitude) && !isNaN(station.longitude)
      );
      
      setStations(processedStations);
    } catch (error) {
      const errorMessage = errorUtils.handleApiError(error);
      setError(`Lỗi tải trạm của ${provinceName}: ${errorMessage}`);
      errorUtils.logError(error, `loadStationsByProvince: ${provinceName}`);
    } finally {
      setLoading(false);
    }
  }, [loadStations]);

  // Update filters
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Auto-load when province changes
    if (key === 'province') {
      loadStationsByProvince(value);
    }
  }, [loadStationsByProvince]);

  // Get filtered stations
  const filteredStations = useCallback(() => {
    return dataUtils.filterStations(stations, filters);
  }, [stations, filters]);

  // Retry loading
  const retry = useCallback(() => {
    if (filters.province) {
      loadStationsByProvince(filters.province);
    } else {
      loadStations();
    }
  }, [filters.province, loadStations, loadStationsByProvince]);

  return {
    stations,
    filteredStations: filteredStations(),
    loading,
    error,
    filters,
    updateFilter,
    loadStations,
    loadStationsByProvince,
    retry
  };
};

// Hook for managing provinces
export const useProvinces = () => {
  const [provinces, setProvinces] = useState([]);
  const [provinceStats, setProvinceStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load provinces
  const loadProvinces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const provinceNames = await provinceService.getAllProvinces();
      setProvinces(provinceNames);
    } catch (error) {
      const errorMessage = errorUtils.handleApiError(error);
      setError(errorMessage);
      errorUtils.logError(error, 'loadProvinces');
      
      // Fallback to default provinces
      const fallbackProvinces = [
        'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
        'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu'
      ];
      setProvinces(fallbackProvinces);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load province statistics
  const loadProvinceStats = useCallback(async () => {
    try {
      const stats = await provinceService.getProvinceStats();
      setProvinceStats(stats);
    } catch (error) {
      errorUtils.logError(error, 'loadProvinceStats');
      // Use mock stats as fallback
      const mockStats = provinceService.getMockProvinceStats();
      setProvinceStats(mockStats);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadProvinces();
    loadProvinceStats();
  }, [loadProvinces, loadProvinceStats]);

  return {
    provinces,
    provinceStats,
    loading,
    error,
    loadProvinces,
    loadProvinceStats
  };
};

// Hook for managing map state
export const useMapState = (initialCenter = [16.0, 108.0], initialZoom = 6) => {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [mapBounds, setMapBounds] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  // Update map view
  const updateMapView = useCallback((center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, []);

  // Update map bounds
  const updateMapBounds = useCallback((bounds) => {
    setMapBounds(bounds);
  }, []);

  // Select station
  const selectStation = useCallback((station) => {
    setSelectedStation(station);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedStation(null);
  }, []);

  // Fit map to stations
  const fitToStations = useCallback((stations) => {
    if (!stations || stations.length === 0) {
      setMapCenter(initialCenter);
      setMapZoom(initialZoom);
      return;
    }

    const coordinates = stations.map(station => ({
      lat: station.latitude,
      lng: station.longitude
    }));

    // Calculate bounds
    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);
    
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };

    setMapBounds(bounds);
    
    // Calculate center
    const center = [
      (bounds.north + bounds.south) / 2,
      (bounds.east + bounds.west) / 2
    ];
    
    setMapCenter(center);
  }, [initialCenter, initialZoom]);

  return {
    mapCenter,
    mapZoom,
    mapBounds,
    selectedStation,
    updateMapView,
    updateMapBounds,
    selectStation,
    clearSelection,
    fitToStations
  };
};
