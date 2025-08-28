import React from 'react';
import { formatUtils } from '../../../shared/utils';
import './ProvinceStats.css';

const ProvinceStats = ({ 
  selectedProvince, 
  provinceStats, 
  loading = false 
}) => {
  if (!selectedProvince) {
    return null;
  }

  const stats = provinceStats[selectedProvince];
  
  if (loading) {
    return (
      <div className="province-stats loading">
        <div className="stats-header">
          <h3 className="stats-title">
            📊 Thống kê: {selectedProvince}
          </h3>
        </div>
        <div className="stats-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="province-stats error">
        <div className="stats-header">
          <h3 className="stats-title">
            📊 Thống kê: {selectedProvince}
          </h3>
        </div>
        <div className="stats-content">
          <div className="no-data">
            <p>Không có dữ liệu cho tỉnh này</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalStations = 0,
    avgRainfall = 0,
    maxRainfall = 0,
    minRainfall = 0,
    stationsWithRain = 0
  } = stats;

  const rainPercentage = totalStations > 0 
    ? ((stationsWithRain / totalStations) * 100).toFixed(1)
    : 0;

  return (
    <div className="province-stats">
      <div className="stats-header">
        <h3 className="stats-title">
          📊 Thống kê: {selectedProvince}
        </h3>
      </div>
      
      <div className="stats-content">
        <div className="stats-grid">
          {/* Tổng số trạm */}
          <div className="stat-item primary">
            <div className="stat-icon">🏢</div>
            <div className="stat-details">
              <span className="stat-label">Tổng số trạm</span>
              <span className="stat-value">{totalStations}</span>
            </div>
          </div>

          {/* Lượng mưa trung bình */}
          <div className="stat-item">
            <div className="stat-icon">☔</div>
            <div className="stat-details">
              <span className="stat-label">TB lượng mưa</span>
              <span className="stat-value">
                {formatUtils.formatNumber(avgRainfall)} mm
              </span>
            </div>
          </div>

          {/* Lượng mưa cao nhất */}
          <div className="stat-item success">
            <div className="stat-icon">🌧️</div>
            <div className="stat-details">
              <span className="stat-label">Cao nhất</span>
              <span className="stat-value">
                {formatUtils.formatNumber(maxRainfall)} mm
              </span>
            </div>
          </div>

          {/* Lượng mưa thấp nhất */}
          <div className="stat-item info">
            <div className="stat-icon">🌤️</div>
            <div className="stat-details">
              <span className="stat-label">Thấp nhất</span>
              <span className="stat-value">
                {formatUtils.formatNumber(minRainfall)} mm
              </span>
            </div>
          </div>

          {/* Trạm có mưa */}
          <div className="stat-item warning">
            <div className="stat-icon">🌦️</div>
            <div className="stat-details">
              <span className="stat-label">Trạm có mưa</span>
              <span className="stat-value">
                {stationsWithRain}/{totalStations}
              </span>
            </div>
          </div>

          {/* Tỷ lệ có mưa */}
          <div className="stat-item secondary">
            <div className="stat-icon">📊</div>
            <div className="stat-details">
              <span className="stat-label">Tỷ lệ có mưa</span>
              <span className="stat-value">{rainPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Progress bar cho tỷ lệ có mưa */}
        <div className="rain-progress">
          <div className="progress-label">
            Tỷ lệ trạm có mưa: {rainPercentage}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${rainPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvinceStats;
