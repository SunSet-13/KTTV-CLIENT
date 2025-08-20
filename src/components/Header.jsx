import React, { useState, useRef, useEffect } from 'react';

function Header({ onMapClick, onDataTableClick, onChartsClick }) {
  const [showDataDropdown, setShowDataDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDataDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDataClick = (e) => {
    e.preventDefault();
    setShowDataDropdown(!showDataDropdown);
  };

  const handleDataTableClick = (e) => {
    e.preventDefault();
    setShowDataDropdown(false);
    onDataTableClick && onDataTableClick();
  };

  const handleChartsClick = (e) => {
    e.preventDefault();
    setShowDataDropdown(false);
    onChartsClick && onChartsClick();
  };

  return (
    <header>
      <div>
        <h1>TRUNG TÂM</h1>
        <p>THÔNG TIN VÀ DỮ LIỆU KHÍ TƯỢNG THỦY VĂN</p>
      </div>
      <nav>
        <a href="#" onClick={(e) => e.preventDefault()}>Trang chủ</a>
        <div className="dropdown" ref={dropdownRef}>
          <a href="#" onClick={handleDataClick} className="dropdown-toggle">
            Dữ liệu <i className={`fas fa-chevron-${showDataDropdown ? 'up' : 'down'}`}></i>
          </a>
          {showDataDropdown && (
            <div className="dropdown-menu">
              <a href="#" onClick={handleDataTableClick}>
                <i className="fas fa-database"></i>
                Truy xuất dữ liệu
              </a>
              <a href="#" onClick={handleChartsClick}>
                <i className="fas fa-chart-line"></i>
                Biểu đồ & thống kê
              </a>
            </div>
          )}
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); onMapClick && onMapClick(); }}>Bản đồ</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Tìm kiếm</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Hướng dẫn</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Liên hệ</a>
      </nav>
    </header>
  );
}

export default Header;
