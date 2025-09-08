import React from 'react';

function ComponentDemo({ 
  onMapClick, 
  onKTTVMapClick, 
  onDataTableClick, 
  onChartsClick,
  onKTTVMapModularClick 
}) {
  return (
    <section className="section">
      <h2>Xem trực tiếp</h2>
      <div className="grid">
        <div className="card">
          <h3>🗺️ Bản đồ mưa</h3>
          <p>Theo dõi lượng mưa thời gian thực trên toàn quốc</p>
          <div className="button-group">
            <button onClick={onMapClick} className="btn btn-primary">
              Bản đồ cơ bản
            </button>
            <button onClick={onKTTVMapClick} className="btn btn-secondary">
              Bản đồ KTTV
            </button>
            <button onClick={onKTTVMapModularClick} className="btn btn-accent">
              Bản đồ Modular ✨
            </button>
          </div>
        </div>

        <div className="card">
          <h3>📊 Truy xuất dữ liệu</h3>
          <p>Xem và phân tích dữ liệu chi tiết từ các trạm đo</p>
          <button onClick={onDataTableClick} className="btn btn-primary">
            Xem dữ liệu
          </button>
        </div>

        <div className="card">
          <h3>📈 Biểu đồ & thống kê</h3>
          <p>Trực quan hóa dữ liệu bằng biểu đồ và báo cáo</p>
          <button onClick={onChartsClick} className="btn btn-primary">
            Xem biểu đồ
          </button>
        </div>
      </div>
    </section>
  );
}

export default ComponentDemo;