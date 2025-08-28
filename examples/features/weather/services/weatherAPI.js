// features/weather/services/weatherAPI.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class WeatherAPI {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getWeatherData(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.province) queryParams.append('province', filters.province);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const query = queryParams.toString();
    const endpoint = `/weather${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  async getStationsByProvince(provinceName) {
    return this.request(`/stations?province=${encodeURIComponent(provinceName)}`);
  }

  async getProvinces() {
    return this.request('/provinces');
  }

  async getRainfallData(stationId, dateRange) {
    const { startDate, endDate } = dateRange;
    return this.request(`/rainfall/${stationId}?start=${startDate}&end=${endDate}`);
  }
}

export const weatherAPI = new WeatherAPI();
