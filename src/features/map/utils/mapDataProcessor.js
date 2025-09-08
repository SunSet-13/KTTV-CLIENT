/**
 * Data processing utilities for map stations
 */
export class MapDataProcessor {
  /**
   * Validate coordinates
   */
  static isValidCoordinate(lat, lon) {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180 &&
           !(lat === 0 && lon === 0);
  }

  /**
   * Process station rain data (from /station-rain API)
   */
  static processStationRainData(apiData) {
    const stationsMap = new Map();
    apiData.forEach(item => {
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      if (!this.isValidCoordinate(lat, lon)) return;
      const stationId = item.StationID;
      // API mới: dùng DateTime, nếu không có thì fallback DtDate
      const itemDate = new Date(item.DateTime || item.DtDate);
      if (!stationsMap.has(stationId) || itemDate > new Date(stationsMap.get(stationId).dateTime)) {
        stationsMap.set(stationId, {
          id: item.StationID,
          code: item.StationID?.toString() || 'N/A',
          name: item.StationNameVN || item.StationName || 'Unknown',
          latitude: lat,
          longitude: lon,
          rainValue: parseFloat(item.RainValue) || 0,
          dateTime: item.DateTime || item.DtDate,
          province: item.ProvinceName || item.Province || 'Unknown'
        });
      }
    });
    return Array.from(stationsMap.values());
  }

  /**
   * Process rain time data (from /rain-time API)
   */
  static processRainTimeData(apiData) {
    const stationsMap = new Map();
    
    apiData.forEach(item => {
      const lat = parseFloat(item.Latitude);
      const lon = parseFloat(item.Longitude);
      
      if (!this.isValidCoordinate(lat, lon)) return;
      
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
    
    return Array.from(stationsMap.values());
  }

  /**
   * Calculate statistics from stations data
   */
  static calculateStats(stations, rainfallColors) {
    const stats = {
      total: stations.length,
      withRain: 0,
      ranges: {}
    };

    // Initialize ranges
    rainfallColors.forEach(range => {
      stats.ranges[range.label] = 0;
    });

    // Count stations in each range
    stations.forEach(station => {
      if (station.rainValue > 0) {
        stats.withRain++;
      }

      // Find appropriate range
      for (const range of rainfallColors) {
        if (range.min !== undefined && range.max !== undefined) {
          if (station.rainValue >= range.min && station.rainValue < range.max) {
            stats.ranges[range.label]++;
            break;
          }
        } else if (range.min !== undefined && station.rainValue >= range.min) {
          stats.ranges[range.label]++;
          break;
        }
      }
    });

    return stats;
  }
}
