import React from 'react';
import { RAINFALL_COLORS } from '../../../shared/utils/rainfallUtils';
import './MapLegend.css';

const MapLegend = ({ isVisible = true }) => {
  if (!isVisible) return null;

  const legendItems = [
    { min: 0, max: 1, color: RAINFALL_COLORS.LIGHT, label: '0-1mm' },
    { min: 1, max: 5, color: RAINFALL_COLORS.LIGHT_MODERATE, label: '1-5mm' },
    { min: 5, max: 10, color: RAINFALL_COLORS.MODERATE, label: '5-10mm' },
    { min: 10, max: 20, color: RAINFALL_COLORS.MODERATE_HEAVY, label: '10-20mm' },
    { min: 20, max: 50, color: RAINFALL_COLORS.HEAVY, label: '20-50mm' },
    { min: 50, max: 100, color: RAINFALL_COLORS.VERY_HEAVY, label: '50-100mm' },
    { min: 100, max: Infinity, color: RAINFALL_COLORS.EXTREME, label: '>100mm' },
  ];

  return (
    <div className="map-legend">
      <div className="legend-header">
        <h3 className="legend-title">Chú thích lượng mưa</h3>
      </div>
      
      <div className="legend-content">
        {legendItems.map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: item.color }}
              aria-label={`Màu cho ${item.label}`}
            />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="legend-footer">
        <small className="legend-note">
          * Dữ liệu cập nhật theo thời gian thực
        </small>
      </div>
    </div>
  );
};

export default MapLegend;
