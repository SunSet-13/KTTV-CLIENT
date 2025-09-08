import React from 'react';
import './HomePage.css';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="homepage">
      {/* Hero Section với background giống hình */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">KHO DỮ LIỆU KHÍ TƯỢNG THỦY VĂN QUỐC GIA</h1>
          <p className="hero-subtitle">
            TRUY CẬP, PHÂN TÍCH VÀ CHIA SẺ DỮ LIỆU KHÍ HẬU CHÍNH XÁC, ĐẦY ĐỦ VÀ CẬP NHẬT NHẤT.
          </p>
        </div>
      </section>

      {/* Main Content Section - Layout như trong hình */}
      <section className="main-content-section">
        <div className="container">
          {/* Title */}
          <h2 className="content-title">Chức năng nổi bật</h2>
          
          <div className="content-layout">
            {/* Chú giải bên trái */}
            <div className="legend-section">
              <div className="legend-box">
                <h3 className="legend-title">Chú giải</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFFF80' }}></span>
                    <span>0–1 mm</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFD700' }}></span>
                    <span>1–5 mm</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFA500' }}></span>
                    <span>5–10 mm</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF8C00' }}></span>
                    <span>10–20 mm</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF4500' }}></span>
                    <span>20–30 mm</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#DC143C' }}></span>
                    <span>30–50 mm</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#8B0000' }}></span>
                    <span>50+ mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Cards bên phải */}
            <div className="features-section">
              <div className="features-grid">
                <div className="feature-card blue-card" onClick={() => onNavigate('dataTable')}>
                  <div className="feature-icon">💧</div>
                  <h3>Truy xuất dữ liệu</h3>
                  <p>Tra cứu dữ liệu khí tượng, thủy văn theo thời gian, trạm, yếu tố và định dạng mong muốn.</p>
                </div>

                <div className="feature-card blue-card" onClick={() => onNavigate('kttvMap')}>
                  <div className="feature-icon">📊</div>
                  <h3>Bản đồ tương tác</h3>
                  <p>Xem trực quan dữ liệu theo lớp bản đồ, vùng ảnh hưởng và mô hình số trị.</p>
                </div>

                <div className="feature-card blue-card" onClick={() => onNavigate('charts')}>
                  <div className="feature-icon">📈</div>
                  <h3>Biểu đồ & thống kê</h3>
                  <p>Phân tích dữ liệu bằng đồ thị, bảng so sánh và báo cáo tự động.</p>
                </div>

                <div className="feature-card blue-card" onClick={() => onNavigate('dataTable')}>
                  <div className="feature-icon">📋</div>
                  <h3>Tài liệu & Hướng dẫn</h3>
                  <p>Tiếp cận kho hướng dẫn sử dụng, quy định và bộ tiêu chuẩn dữ liệu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
