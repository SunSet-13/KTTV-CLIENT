import React from 'react';
import './MapFilters.css';

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const MapFilters = ({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  onGoBack, 
  loading,
  sidebarOpen,
  onToggleSidebar
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="map-filters">
      {/* Header */}
      <div className="map-header">
        <div className="header-left">
          <button 
            className="back-button" 
            onClick={onGoBack}
            aria-label="Quay lại"
          >
            ← Quay lại
          </button>
          <h1 className="map-title">Bản đồ KTTV</h1>
        </div>
        
        <div className="header-controls">
          <button 
            className="refresh-button" 
            onClick={onRefresh} 
            disabled={loading}
            aria-label="Làm mới dữ liệu"
          >
            {loading ? '🔄' : '↻'} Làm mới
          </button>
          
          <button 
            className="sidebar-toggle" 
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {sidebarOpen && (
        <div className="filters-panel">
          {/* Data Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Loại dữ liệu:</label>
            <select 
              className="filter-select"
              value={filters.dataType} 
              onChange={(e) => handleFilterChange('dataType', e.target.value)}
            >
              <option value="rainfall">Lượng mưa</option>
              <option value="temperature">Nhiệt độ</option>
              <option value="humidity">Độ ẩm</option>
            </select>
          </div>

          {/* Province Filter */}
          <div className="filter-group">
            <label className="filter-label">Tỉnh/Thành phố:</label>
            <select 
              className="filter-select"
              value={filters.province} 
              onChange={(e) => handleFilterChange('province', e.target.value)}
            >
              <option value="">Tất cả tỉnh</option>
              {PROVINCES.map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="filter-group">
            <label className="filter-label">Ngày:</label>
            <input 
              type="date" 
              className="filter-input"
              value={filters.selectedDate} 
              onChange={(e) => handleFilterChange('selectedDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Khoảng thời gian:</label>
            <select 
              className="filter-select"
              value={filters.timeRange} 
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="1h">1 giờ qua</option>
              <option value="3h">3 giờ qua</option>
              <option value="6h">6 giờ qua</option>
              <option value="12h">12 giờ qua</option>
              <option value="24h">24 giờ qua</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilters;
