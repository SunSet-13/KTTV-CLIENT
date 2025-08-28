// Date and time utilities
export const dateUtils = {
  // Format date for display
  formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('vi-VN');
  },

  // Format date for API calls
  formatDateForAPI(date) {
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  },

  // Get current date in YYYY-MM-DD format
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  },

  // Check if date is valid
  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  },

  // Get date range
  getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return {
      startDate: this.formatDateForAPI(startDate),
      endDate: this.formatDateForAPI(endDate)
    };
  }
};

// Geographic utilities
export const geoUtils = {
  // Validate coordinates
  isValidCoordinate(lat, lon) {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180 &&
           !(lat === 0 && lon === 0);
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Get center point of coordinates array
  getCenterPoint(coordinates) {
    if (!coordinates || coordinates.length === 0) {
      return { lat: 16.0, lng: 108.0 }; // Default center for Vietnam
    }

    const total = coordinates.reduce(
      (acc, coord) => ({
        lat: acc.lat + coord.lat,
        lng: acc.lng + coord.lng
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: total.lat / coordinates.length,
      lng: total.lng / coordinates.length
    };
  }
};

// Data processing utilities
export const dataUtils = {
  // Process station data from API
  processStationData(apiData) {
    if (!Array.isArray(apiData)) {
      console.warn('Expected array for station data, got:', typeof apiData);
      return [];
    }

    const stationsMap = new Map();
    
    apiData.forEach(item => {
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      
      if (!geoUtils.isValidCoordinate(lat, lon)) return;
      
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
    
    return Array.from(stationsMap.values());
  },

  // Filter stations by criteria
  filterStations(stations, filters = {}) {
    let filtered = [...stations];

    // Filter by province
    if (filters.province) {
      filtered = filtered.filter(station => 
        station.province === filters.province
      );
    }

    // Filter by rainfall range
    if (filters.minRain !== undefined) {
      filtered = filtered.filter(station => 
        station.rainValue >= filters.minRain
      );
    }

    if (filters.maxRain !== undefined) {
      filtered = filtered.filter(station => 
        station.rainValue <= filters.maxRain
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(station => 
        new Date(station.dateTime) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(station => 
        new Date(station.dateTime) <= new Date(filters.endDate)
      );
    }

    return filtered;
  },

  // Calculate statistics from station data
  calculateStats(stations) {
    const total = stations.length;
    const withRain = stations.filter(s => s.rainValue > 0).length;
    const noRain = total - withRain;
    const heavyRain = stations.filter(s => s.rainValue > 15).length;

    const rainValues = stations.map(s => s.rainValue);
    const totalRainfall = rainValues.reduce((sum, val) => sum + val, 0);
    const averageRainfall = total > 0 ? totalRainfall / total : 0;
    const maxRainfall = Math.max(...rainValues, 0);
    const minRainfall = Math.min(...rainValues, 0);

    return {
      total,
      withRain,
      noRain,
      heavyRain,
      totalRainfall: parseFloat(totalRainfall.toFixed(2)),
      averageRainfall: parseFloat(averageRainfall.toFixed(2)),
      maxRainfall,
      minRainfall
    };
  },

  // Group stations by province
  groupByProvince(stations) {
    return stations.reduce((groups, station) => {
      const province = station.province || 'Unknown';
      if (!groups[province]) {
        groups[province] = [];
      }
      groups[province].push(station);
      return groups;
    }, {});
  },

  // Sort stations by criteria
  sortStations(stations, sortBy = 'name', order = 'asc') {
    return [...stations].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle different data types
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }
};

// Number formatting utilities
export const formatUtils = {
  // Format numbers for display
  formatNumber(num, decimals = 1) {
    return parseFloat(num).toFixed(decimals);
  },

  // Format large numbers with units
  formatLargeNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Format percentage
  formatPercentage(num, total) {
    if (total === 0) return '0%';
    return ((num / total) * 100).toFixed(1) + '%';
  }
};

// Error handling utilities
export const errorUtils = {
  // Handle API errors
  handleApiError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.';
    }
    
    if (error.message.includes('404')) {
      return 'Không tìm thấy dữ liệu yêu cầu.';
    }
    
    if (error.message.includes('500')) {
      return 'Lỗi server nội bộ. Vui lòng thử lại sau.';
    }
    
    return error.message || 'Đã xảy ra lỗi không xác định.';
  },

  // Log errors for debugging
  logError(error, context = '') {
    console.error(`Error ${context}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

// Local storage utilities
export const storageUtils = {
  // Save to localStorage
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  // Load from localStorage
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  // Clear all localStorage
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// Re-export rainfall utilities
export * from './rainfallUtils.js';
