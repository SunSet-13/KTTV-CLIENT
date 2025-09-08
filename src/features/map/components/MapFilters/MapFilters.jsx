import React from 'react';
import { PROVINCES } from '../../constants/mapConstants.js';
import './MapFilters.css';

const MapFilters = ({ 
  filters, 
  timeSelection, 
  loading,
  updateFilter, 
  updateTimeSelection, 
  handleLoadByTime 
}) => {
  return (
    <div className="filters-content">
      {/* Data Type Filter */}
      <div className="filter-section">
        <h3><i className="fas fa-database"></i> Loại dữ liệu</h3>
        <select
          value={filters.dataType}
          onChange={(e) => updateFilter('dataType', e.target.value)}
          className="filter-input"
        >
          <option value="rainfall">Lượng mưa</option>
          <option value="temperature">Nhiệt độ</option>
          <option value="humidity">Độ ẩm</option>
        </select>
      </div>

      {/* Province Filter */}
      <div className="filter-section">
        <h3><i className="fas fa-map-marker-alt"></i> Tỉnh/Thành phố</h3>
        <select
          value={filters.province}
          onChange={(e) => updateFilter('province', e.target.value)}
          className="filter-input"
        >
          <option value="">Tất cả tỉnh/thành</option>
          {PROVINCES.map(province => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* Date Filter */}
      <div className="filter-section">
        <h3><i className="fas fa-calendar"></i> Thời gian</h3>
        <input
          type="date"
          value={filters.selectedDate}
          onChange={(e) => updateFilter('selectedDate', e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Specific Time Selection for Rain-Time API */}
      <div className="filter-section">
        <h3><i className="fas fa-clock"></i> Tìm kiếm theo thời gian cụ thể</h3>
        <div className="time-inputs">
          <div className="input-group">
            <label>Năm:</label>
            <input
              type="number"
              value={timeSelection.year}
              onChange={(e) => updateTimeSelection('year', e.target.value)}
              min="2020"
              max="2030"
              className="time-input"
            />
          </div>
          <div className="input-group">
            <label>Tháng:</label>
            <input
              type="number"
              value={timeSelection.month}
              onChange={(e) => updateTimeSelection('month', e.target.value)}
              min="1"
              max="12"
              className="time-input"
            />
          </div>
          <div className="input-group">
            <label>Ngày:</label>
            <input
              type="number"
              value={timeSelection.day}
              onChange={(e) => updateTimeSelection('day', e.target.value)}
              min="1"
              max="31"
              className="time-input"
            />
          </div>
          <div className="input-group">
            <label>Giờ:</label>
            <input
              type="number"
              value={timeSelection.hour}
              onChange={(e) => updateTimeSelection('hour', e.target.value)}
              min="0"
              max="23"
              className="time-input"
            />
          </div>
        </div>
        <button 
          onClick={handleLoadByTime}
          className="load-time-button"
          disabled={loading}
        >
          <i className="fas fa-search"></i>
          {loading ? 'Đang tải...' : 'Tải dữ liệu theo thời gian'}
        </button>
      </div>

      {/* Time Range Filter */}
      <div className="filter-section">
        <h3><i className="fas fa-clock"></i> Bộ lọc Giờ</h3>
        <div className="time-filter-buttons">
          {[
            { value: 'night', label: 'Đêm (0-6h)', icon: 'fa-moon' },
            { value: 'morning', label: 'Sáng (6-12h)', icon: 'fa-sun' },
            { value: 'afternoon', label: 'Chiều (12-18h)', icon: 'fa-sun' },
            { value: 'evening', label: 'Tối (18-24h)', icon: 'fa-moon' }
          ].map(time => (
            <button
              key={time.value}
              className={`time-button ${filters.timeRange === time.value ? 'active' : ''}`}
              onClick={() => updateFilter('timeRange', time.value)}
            >
              <i className={`fas ${time.icon}`}></i>
              {time.label}
            </button>
          ))}
          <button
            className={`time-button ${filters.timeRange === 'all' ? 'active' : ''}`}
            onClick={() => updateFilter('timeRange', 'all')}
          >
            <i className="fas fa-clock"></i>
            Tất cả giờ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;