import { API_URLS } from '../constants/mapConstants.js';


/**
 * API service for map data with retry mechanism
 */
export class MapApiService {
  
  /**
   * Retry mechanism for API calls
   */
  static async retryFetch(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        console.warn(`API call attempt ${i + 1} failed:`, error.message);
        
        if (i === retries - 1) {
          // Last retry failed
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server backend.');
          }
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  /**
   * Fetch station rain data
   */
  static async fetchStationRain() {
    const response = await this.retryFetch(API_URLS.STATION_RAIN);
    const data = await response.json();
  // Backend trả về trường 'data' (array các trạm), không phải 'stationRainData'
  return data?.data || [];
  }

  /**
   * Fetch rain data by specific time
   */
  static async fetchRainByTime(year, month, day, hour) {
    const url = `${API_URLS.RAIN_TIME}?year=${year}&month=${month}&day=${day}&hour=${hour}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data?.data || [];
  }

  /**
   * Fetch province data
   */
  static async fetchProvinces() {
    const response = await fetch(API_URLS.PROVINCES);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Fetch stations by province name
   */
  static async fetchStationsByProvince(provinceName) {
    if (!provinceName) return [];
    // Gọi đúng endpoint mới: /api/provinces/by-name?name=...
    const url = `http://localhost:2004/api/provinces/by-name?name=${encodeURIComponent(provinceName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data?.data || [];
  }
}
