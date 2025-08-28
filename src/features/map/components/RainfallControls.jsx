import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

function RainfallControls({ onFilterChange, onExportData, onModeChange, onAnimationToggle }) {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 86400000));
  const [endDate, setEndDate] = useState(new Date());
  const [stationId, setStationId] = useState('');
  const [stations, setStations] = useState([]);
  const [viewMode, setViewMode] = useState('points');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      // Sử dụng API đã hoạt động
      const response = await fetch('http://localhost:2004/api/station-rain');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Xử lý dữ liệu từ API thực tế
      if (data?.stationRainData?.length > 0) {
        const stationsMap = new Map();
        data.stationRainData.forEach(item => {
          const stationId = item.StationID;
          if (!stationsMap.has(stationId)) {
            stationsMap.set(stationId, {
              id: item.StationID,
              name: item.StationName || 'Unknown',
              code: item.StationNo || 'N/A',
              latitude: parseFloat(item.Latitude),
              longitude: parseFloat(item.Longitude)
            });
          }
        });
        setStations(Array.from(stationsMap.values()));
      } else {
        throw new Error('Không có dữ liệu trạm');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách trạm:', error);
      // Sử dụng dữ liệu mẫu khi không có API
      const mockStations = [
        { id: 1, code: 'HN001', name: 'Hà Nội', latitude: 21.0285, longitude: 105.8542 },
        { id: 2, code: 'HCM001', name: 'TP.HCM', latitude: 10.8231, longitude: 106.6297 },
        { id: 3, code: 'DN001', name: 'Đà Nẵng', latitude: 16.0471, longitude: 108.2068 },
        { id: 4, code: 'CT001', name: 'Cần Thơ', latitude: 10.0452, longitude: 105.7469 },
        { id: 5, code: 'HP001', name: 'Hải Phòng', latitude: 20.8449, longitude: 106.6881 },
        { id: 6, code: 'VT001', name: 'Vũng Tàu', latitude: 10.3460, longitude: 107.0840 },
        { id: 7, code: 'DL001', name: 'Đà Lạt', latitude: 11.9404, longitude: 108.4583 },
        { id: 8, code: 'NT001', name: 'Nha Trang', latitude: 12.2388, longitude: 109.1967 }
      ];
      setStations(mockStations);
    }
  };

  const handleApplyFilter = () => {
    onFilterChange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      stationId
    });
  };

  const handleModeChange = (mode) => {
    setViewMode(mode);
    onModeChange(mode);
  };

  const handleAnimationToggle = () => {
    setIsAnimating(!isAnimating);
    onAnimationToggle(!isAnimating);
  };

  return (
    <div className="rainfall-controls">
      <div>
        <label htmlFor="startDate">Từ ngày:</label>
        <Flatpickr
          value={startDate}
          onChange={([date]) => setStartDate(date)}
          options={{
            enableTime: true,
            dateFormat: 'Y-m-d H:i'
          }}
          style={{ width: '140px' }}
        />
      </div>
      <div>
        <label htmlFor="endDate">Đến ngày:</label>
        <Flatpickr
          value={endDate}
          onChange={([date]) => setEndDate(date)}
          options={{
            enableTime: true,
            dateFormat: 'Y-m-d H:i'
          }}
          style={{ width: '140px' }}
        />
      </div>
      <div>
        <label htmlFor="stationFilter">Trạm:</label>
        <select
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="">Tất cả các trạm</option>
          {stations.map(station => (
            <option key={station.id} value={station.id}>
              {station.name} ({station.code})
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleApplyFilter}>
        <i className="fas fa-filter"></i> Áp dụng
      </button>
      <button onClick={onExportData}>
        <i className="fas fa-file-export"></i> Xuất dữ liệu
      </button>
      <button
        className={viewMode === 'points' ? 'active' : ''}
        onClick={() => handleModeChange('points')}
      >
        <i className="fas fa-dot-circle"></i> Điểm đo
      </button>
      <button
        className={viewMode === 'contour' ? 'active' : ''}
        onClick={() => handleModeChange('contour')}
      >
        <i className="fas fa-wave-square"></i> Đường đẳng trị
      </button>
      <button onClick={handleAnimationToggle}>
        <i className={isAnimating ? 'fas fa-pause' : 'fas fa-play'}></i> Animation
      </button>
    </div>
  );
}

export default RainfallControls;
