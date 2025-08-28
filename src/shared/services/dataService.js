import { apiClient, API_CONFIG } from './api.js';

// Station data service
export const stationService = {
  // Get all stations
  async getAllStations() {
    try {
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.STATIONS);
      return data.stationRainData || data;
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      throw error;
    }
  },

  // Get stations by province
  async getStationsByProvince(provinceName) {
    try {
      const data = await apiClient.get(`${API_CONFIG.ENDPOINTS.PROVINCES}/stations`, {
        province: provinceName
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch stations for province ${provinceName}:`, error);
      throw error;
    }
  },

  // Get station by ID
  async getStationById(stationId) {
    try {
      const data = await apiClient.get(`${API_CONFIG.ENDPOINTS.STATIONS}/${stationId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch station ${stationId}:`, error);
      throw error;
    }
  },

  // Get station data by date range
  async getStationsByDateRange(startDate, endDate) {
    try {
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.STATIONS, {
        startDate,
        endDate
      });
      return data.stationRainData || data;
    } catch (error) {
      console.error('Failed to fetch stations by date range:', error);
      throw error;
    }
  }
};

// Province data service
export const provinceService = {
  // Get all provinces
  async getAllProvinces() {
    try {
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.PROVINCES);
      
      // Handle different API response formats
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(item => item.ProvinceName).filter(Boolean);
      } else if (Array.isArray(data)) {
        return data.map(item => item.ProvinceName || item.name || item).filter(Boolean);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
      throw error;
    }
  },

  // Get province statistics
  async getProvinceStats() {
    try {
      const data = await apiClient.get(`${API_CONFIG.ENDPOINTS.PROVINCES}/statistics`);
      return data;
    } catch (error) {
      console.error('Failed to fetch province statistics:', error);
      // Return mock data as fallback
      return this.getMockProvinceStats();
    }
  },

  // Mock province statistics (fallback)
  getMockProvinceStats() {
    const provinces = [
      'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
      'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
      'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
      'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
      'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang'
    ];

    const mockStats = {};
    provinces.forEach(province => {
      mockStats[province] = {
        totalStations: Math.floor(Math.random() * 50) + 10,
        activeStations: Math.floor(Math.random() * 40) + 5,
        averageRainfall: (Math.random() * 100).toFixed(1)
      };
    });
    return mockStats;
  }
};

// Charts data service
export const chartsService = {
  // Get chart data
  async getChartData(type = 'rainfall', period = 'daily') {
    try {
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.CHARTS, {
        type,
        period
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      throw error;
    }
  },

  // Get rainfall statistics
  async getRainfallStats(startDate, endDate) {
    try {
      const data = await apiClient.get(`${API_CONFIG.ENDPOINTS.CHARTS}/rainfall-stats`, {
        startDate,
        endDate
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch rainfall statistics:', error);
      throw error;
    }
  },

  // Get weather trends
  async getWeatherTrends(type, days = 7) {
    try {
      const data = await apiClient.get(`${API_CONFIG.ENDPOINTS.WEATHER}/trends`, {
        type,
        days
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch weather trends:', error);
      throw error;
    }
  }
};
