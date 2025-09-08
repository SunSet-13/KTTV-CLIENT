import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import './ProvinceRainfallChart.css';

Chart.register(...registerables);

const StationRainfallBarChart = () => {
  // State
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [stations, setStations] = useState([]);
  const [rainfallData, setRainfallData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Time selection - sử dụng dữ liệu có thực tế
  const [timeSelection, setTimeSelection] = useState({
    year: 2025,
    month: 8,
    day: 4,  // Ngày có dữ liệu theo API bạn cung cấp
    hour: 9 // Giờ 9 có dữ liệu mưa nhiều hơn (16.2mm max)
  });

  // Chart refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const response = await fetch('http://localhost:2004/api/provinces');
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      
      // Extract province names from API response
      if (data.success && data.data && Array.isArray(data.data)) {
        const provinceNames = data.data.map(item => item.ProvinceName);
        setProvinces(provinceNames);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
      // Mock data fallback với tên chính xác từ API
      setProvinces([
        'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk',
        'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Tĩnh',
        'Hưng Yên', 'Khánh Hoà', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn',
        'Lào Cai', 'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ngãi',
        'Quảng Ninh', 'Quảng Trị', 'Sơn La', 'Tây Ninh', 'Thái Nguyên',
        'Thanh Hóa', 'TP. Cần Thơ', 'TP. Đà Nẵng', 'TP. Hà Nội',
        'TP. Hải Phòng', 'TP. Hồ Chí Minh', 'TP. Huế', 'Tuyên Quang', 'Vĩnh Long'
      ]);
    }
  };

  // Load rainfall data for specific hour
  const loadRainfallData = async () => {
    if (!selectedProvince) {
      setError('Vui lòng chọn tỉnh');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { year, month, day, hour } = timeSelection;
      
      console.log(`Loading data for ${selectedProvince} at ${year}-${month}-${day} ${hour}:00`);
      
      // Sử dụng API format chính xác mà user cung cấp
      const response = await fetch(
        `http://localhost:2004/api/rain-province-time?` +
        `province=${encodeURIComponent(selectedProvince)}` +
        `&year=${year}&month=${month}&day=${day}&hour=${hour}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.success && data?.data?.length > 0) {
        // Process data - xử lý dữ liệu từ API chính xác
        const processedData = data.data.map(item => ({
          ...item,
          stationId: item.StationID || item.stationId || item.StationName,
          stationName: item.StationNameVN || item.StationName || item.stationName || `Trạm ${item.StationID}`,
          // Sử dụng chính xác RainValue từ API response
          value: parseFloat(item.RainValue || 0),
          latitude: item.Latitude,
          longitude: item.Longitude,
          provinceName: item.ProvinceName,
          hour: hour,
          timestamp: new Date(year, month - 1, day, hour),
          // Thêm các trường khác từ API
          year: item.Year,
          month: item.Month,
          dayOfMonth: item.Day,
          hourOfDay: item.Hour,
          dateTime: item.DateTime
        }));
        
        // Sort by rainfall value (descending) for better visualization
        processedData.sort((a, b) => b.value - a.value);
        
        setRainfallData(processedData);
        setStations(processedData);
        renderBarChart(processedData);
        
      } else {
        setError(`Không có dữ liệu cho tỉnh "${selectedProvince}" vào ${hour}:00 ngày ${day}/${month}/${year}`);
        setRainfallData([]);
        setStations([]);
      }
      
    } catch (error) {
      console.error('Error loading rainfall data:', error);
      setError('Không thể tải dữ liệu mưa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = useCallback((data) => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Prepare data for bar chart
    const labels = data.map(item => item.stationName);
    const values = data.map(item => item.value);
    
    // Color coding based on rainfall intensity (theo ảnh bạn gửi)
    const backgroundColors = values.map(value => {
      if (value === 0) return 'rgba(200, 200, 200, 0.8)'; // Xám - 0mm
      if (value > 0 && value <= 1) return 'rgba(255, 255, 0, 0.8)'; // Vàng - 0-1 mm
      if (value > 1 && value <= 5) return 'rgba(255, 215, 0, 0.8)'; // Vàng đậm - 1-5 mm
      if (value > 5 && value <= 10) return 'rgba(255, 165, 0, 0.8)'; // Cam - 5-10 mm
      if (value > 10 && value <= 20) return 'rgba(255, 69, 0, 0.8)'; // Cam đỏ - 10-20 mm
      if (value > 20 && value <= 30) return 'rgba(255, 0, 0, 0.8)'; // Đỏ - 20-30 mm
      if (value > 30 && value <= 50) return 'rgba(139, 0, 0, 0.8)'; // Đỏ đậm - 30-50 mm
      return 'rgba(128, 0, 128, 0.8)'; // Tím - >50 mm
    });

    const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new bar chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Lượng mưa (mm)',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Lượng mưa các trạm tại ${selectedProvince} - ${timeSelection.hour}:00 ngày ${timeSelection.day}/${timeSelection.month}/${timeSelection.year}`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const dataPoint = data[context.dataIndex];
                return [
                  `Lượng mưa: ${context.parsed.y} mm`,
                  `Tọa độ: ${dataPoint.latitude?.toFixed(4)}, ${dataPoint.longitude?.toFixed(4)}`,
                  `Giờ: ${timeSelection.hour}:00`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Trạm đo mưa',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Lượng mưa (mm)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }, [selectedProvince, timeSelection]);

  const handleTimeChange = (field, value) => {
    setTimeSelection(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  // Get color legend for rainfall intensity (theo ảnh)
  const getRainfallLegend = () => (
    <div className="rainfall-legend" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Chú giải - Thang màu lượng mưa:</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(200, 200, 200, 0.8)', border: '1px solid #ccc' }}></div>
          <span>0 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(255, 255, 0, 0.8)', border: '1px solid #ccc' }}></div>
          <span>0-1 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(255, 215, 0, 0.8)', border: '1px solid #ccc' }}></div>
          <span>1-5 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(255, 165, 0, 0.8)', border: '1px solid #ccc' }}></div>
          <span>5-10 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(255, 69, 0, 0.8)', border: '1px solid #ccc' }}></div>
          <span>10-20 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(255, 0, 0, 0.8)', border: '1px solid #ccc' }}></div>
          <span>20-30 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(139, 0, 0, 0.8)', border: '1px solid #ccc' }}></div>
          <span>30-50 mm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '15px', backgroundColor: 'rgba(128, 0, 128, 0.8)', border: '1px solid #ccc' }}></div>
          <span>&gt;50 mm</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="province-rainfall-chart">
      <div className="chart-header">
        <h2>Biểu đồ cột lượng mưa theo trạm</h2>
        
        <div className="controls">
          <div className="control-group">
            <label>Tỉnh/Thành phố:</label>
            <select 
              value={selectedProvince} 
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Năm:</label>
            <input
              type="number"
              value={timeSelection.year}
              onChange={(e) => handleTimeChange('year', e.target.value)}
              min="2020"
              max="2030"
            />
          </div>

          <div className="control-group">
            <label>Tháng:</label>
            <input
              type="number"
              value={timeSelection.month}
              onChange={(e) => handleTimeChange('month', e.target.value)}
              min="1"
              max="12"
            />
          </div>

          <div className="control-group">
            <label>Ngày:</label>
            <input
              type="number"
              value={timeSelection.day}
              onChange={(e) => handleTimeChange('day', e.target.value)}
              min="1"
              max="31"
            />
          </div>

          <div className="control-group">
            <label>Giờ:</label>
            <input
              type="number"
              value={timeSelection.hour}
              onChange={(e) => handleTimeChange('hour', e.target.value)}
              min="0"
              max="23"
            />
          </div>

          <button 
            onClick={loadRainfallData}
            disabled={loading || !selectedProvince}
            className="load-button"
          >
            {loading ? 'Đang tải...' : 'Tải dữ liệu'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {selectedProvince && (
        <div className="province-info">
          <strong>Tỉnh đã chọn:</strong> {selectedProvince} | 
          <strong> Thời gian:</strong> {timeSelection.hour}:00 ngày {timeSelection.day}/{timeSelection.month}/{timeSelection.year}
        </div>
      )}

      {stations.length > 0 && (
        <div className="stations-info">
          <strong>Số trạm có dữ liệu:</strong> {stations.length}
          <span style={{ marginLeft: '15px', fontSize: '0.9em', color: '#666' }}>
            Lượng mưa cao nhất: {Math.max(...stations.map(s => s.value))} mm
            | Thấp nhất: {Math.min(...stations.map(s => s.value))} mm
            | Trung bình: {(stations.reduce((sum, s) => sum + s.value, 0) / stations.length).toFixed(2)} mm
          </span>
        </div>
      )}

      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>

      {stations.length > 0 && getRainfallLegend()}

      {rainfallData.length > 0 && (
        <div className="data-summary" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h4>Chi tiết các trạm (sắp xếp theo lượng mưa giảm dần):</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>STT</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên trạm</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Lượng mưa (mm)</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Vĩ độ</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Kinh độ</th>
                </tr>
              </thead>
              <tbody>
                {rainfallData.map((station, index) => (
                  <tr key={station.stationId} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{station.stationName}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: station.value > 0 ? 'bold' : 'normal', color: station.value > 0 ? '#007bff' : '#6c757d' }}>
                      {station.value}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{station.latitude?.toFixed(4)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{station.longitude?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationRainfallBarChart;
