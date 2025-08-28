import React from 'react';

function Features() {
  const features = [
    {
      icon: 'fas fa-database',
      title: 'Truy xuất dữ liệu',
      description: 'Tra cứu dữ liệu khí tượng, thủy văn theo thời gian, trạm, yếu tố và định dạng mong muốn.'
    },
    {
      icon: 'fas fa-map',
      title: 'Bản đồ tương tác',
      description: 'Xem trực quan dữ liệu theo lớp bản đồ, vùng ảnh hưởng và mô hình số trị.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Biểu đồ & thống kê',
      description: 'Phân tích dữ liệu bằng đồ thị, bảng so sánh và báo cáo tự động.'
    },
    {
      icon: 'fas fa-book',
      title: 'Tài liệu & Hướng dẫn',
      description: 'Tiếp cận kho hướng dẫn sử dụng, quy định và bộ tiêu chuẩn dữ liệu.'
    }
  ];

  return (
    <section className="section">
      <h2>Chức năng nổi bật</h2>
      <div className="grid">
        {features.map((feature, index) => (
          <div key={index} className="card">
            <h3>
              <i className={feature.icon}></i> {feature.title}
            </h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
