// Rainfall color scale configuration
export const RAINFALL_COLORS = [
  { min: 0, max: 0, color: '#FFFFFF', label: '0 mm' },
  { min: 0.1, max: 5, color: '#90EE90', label: '0.1-5 mm' },
  { min: 5, max: 15, color: '#FFFF00', label: '5-15 mm' },
  { min: 15, max: 25, color: '#FFA500', label: '15-25 mm' },
  { min: 25, max: 40, color: '#FF6347', label: '25-40 mm' },
  { min: 40, max: 60, color: '#FF1493', label: '40-60 mm' },
  { min: 60, max: 80, color: '#8B008B', label: '60-80 mm' },
  { min: 80, max: 100, color: '#4B0082', label: '80-100 mm' },
  { min: 100, max: 999, color: '#8B0000', label: '100+ mm' }
];

// Rainfall intensity levels
export const RAINFALL_LEVELS = {
  NONE: { min: 0, max: 0, level: 'none', description: 'Không mưa' },
  LIGHT: { min: 0.1, max: 5, level: 'light', description: 'Mưa nhỏ' },
  MODERATE: { min: 5, max: 15, level: 'moderate', description: 'Mưa vừa' },
  HEAVY: { min: 15, max: 25, level: 'heavy', description: 'Mưa khá' },
  VERY_HEAVY: { min: 25, max: 40, level: 'very-heavy', description: 'Mưa to' },
  INTENSE: { min: 40, max: 60, level: 'intense', description: 'Mưa rất to' },
  TORRENTIAL: { min: 60, max: 100, level: 'torrential', description: 'Mưa cực to' },
  EXTREME: { min: 100, max: 999, level: 'extreme', description: 'Mưa đặc biệt to' }
};

// Rainfall utilities
export const rainfallUtils = {
  // Get color for rainfall value
  getColorForRainfall(value) {
    for (const range of RAINFALL_COLORS) {
      if (value >= range.min && value <= range.max) {
        return range.color;
      }
    }
    return RAINFALL_COLORS[0].color;
  },

  // Get rainfall level
  getRainfallLevel(value) {
    for (const level of Object.values(RAINFALL_LEVELS)) {
      if (value >= level.min && value <= level.max) {
        return level;
      }
    }
    return RAINFALL_LEVELS.NONE;
  },

  // Get rainfall intensity description
  getRainfallDescription(value) {
    const level = this.getRainfallLevel(value);
    return level.description;
  },

  // Calculate marker radius based on rainfall
  getMarkerRadius(rainValue, minRadius = 4, maxRadius = 12) {
    return Math.max(minRadius, Math.min(rainValue * 0.2 + minRadius, maxRadius));
  },

  // Group stations by rainfall ranges
  groupByRainfallRanges(stations) {
    const groups = {};
    
    RAINFALL_COLORS.forEach(range => {
      groups[range.label] = stations.filter(station => 
        station.rainValue >= range.min && station.rainValue <= range.max
      );
    });
    
    return groups;
  },

  // Get rainfall statistics by ranges
  getRainfallStats(stations) {
    const ranges = {};
    let totalRainfall = 0;
    let maxRainfall = 0;
    let maxStation = null;
    
    RAINFALL_COLORS.forEach(range => {
      const stationsInRange = stations.filter(station => 
        station.rainValue >= range.min && station.rainValue <= range.max
      );
      
      ranges[range.label] = {
        count: stationsInRange.length,
        percentage: stations.length > 0 ? (stationsInRange.length / stations.length * 100).toFixed(1) : 0,
        stations: stationsInRange
      };
    });

    stations.forEach(station => {
      totalRainfall += station.rainValue;
      if (station.rainValue > maxRainfall) {
        maxRainfall = station.rainValue;
        maxStation = station;
      }
    });

    return {
      ranges,
      totalStations: stations.length,
      totalRainfall: parseFloat(totalRainfall.toFixed(2)),
      averageRainfall: stations.length > 0 ? parseFloat((totalRainfall / stations.length).toFixed(2)) : 0,
      maxRainfall,
      maxStation,
      withRain: stations.filter(s => s.rainValue > 0).length,
      withoutRain: stations.filter(s => s.rainValue === 0).length
    };
  },

  // Filter stations by rainfall intensity
  filterByIntensity(stations, intensity) {
    const level = RAINFALL_LEVELS[intensity.toUpperCase()];
    if (!level) return stations;
    
    return stations.filter(station => 
      station.rainValue >= level.min && station.rainValue <= level.max
    );
  },

  // Get top rainfall stations
  getTopRainfallStations(stations, limit = 10) {
    return stations
      .filter(station => station.rainValue > 0)
      .sort((a, b) => b.rainValue - a.rainValue)
      .slice(0, limit);
  },

  // Check if rainfall is significant
  isSignificantRainfall(value, threshold = 0.1) {
    return value >= threshold;
  },

  // Format rainfall value for display
  formatRainfallValue(value, unit = 'mm') {
    return `${parseFloat(value).toFixed(1)} ${unit}`;
  },

  // Get rainfall trend (increase/decrease/stable)
  getRainfallTrend(currentValue, previousValue, threshold = 0.5) {
    const diff = currentValue - previousValue;
    
    if (Math.abs(diff) < threshold) {
      return { trend: 'stable', change: 0, description: 'Ổn định' };
    }
    
    if (diff > 0) {
      return { 
        trend: 'increase', 
        change: diff, 
        description: `Tăng ${this.formatRainfallValue(diff)}` 
      };
    }
    
    return { 
      trend: 'decrease', 
      change: Math.abs(diff), 
      description: `Giảm ${this.formatRainfallValue(Math.abs(diff))}` 
    };
  },

  // Calculate rainfall accumulation over time
  calculateAccumulation(stations, timeRange = 24) {
    // This would need actual time-series data
    // For now, return current values as accumulation
    return stations.map(station => ({
      ...station,
      accumulation: station.rainValue,
      timeRange
    }));
  },

  // Get rainfall warnings based on thresholds
  getRainfallWarnings(stations) {
    const warnings = [];
    
    stations.forEach(station => {
      if (station.rainValue >= 100) {
        warnings.push({
          level: 'extreme',
          station,
          message: `Cảnh báo mưa cực to tại ${station.name}: ${this.formatRainfallValue(station.rainValue)}`
        });
      } else if (station.rainValue >= 60) {
        warnings.push({
          level: 'severe',
          station,
          message: `Cảnh báo mưa rất to tại ${station.name}: ${this.formatRainfallValue(station.rainValue)}`
        });
      } else if (station.rainValue >= 25) {
        warnings.push({
          level: 'moderate',
          station,
          message: `Cảnh báo mưa to tại ${station.name}: ${this.formatRainfallValue(station.rainValue)}`
        });
      }
    });
    
    return warnings.sort((a, b) => {
      const levels = { extreme: 3, severe: 2, moderate: 1 };
      return levels[b.level] - levels[a.level];
    });
  }
};
