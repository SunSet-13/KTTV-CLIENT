import React from 'react';
import { RAINFALL_COLORS } from '../../../../shared/utils/rainfallUtils.js';
import { MapDataProcessor } from '../../utils/mapDataProcessor.js';
import './MapLegend.css';

const MapLegend = ({ stations }) => {
  const stats = MapDataProcessor.calculateStats(stations, RAINFALL_COLORS);

  return (
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
          <span className="stat-value">{stats.total - stats.withRain}</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
