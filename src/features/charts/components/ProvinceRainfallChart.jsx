import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import './ProvinceRainfallChart.css';

Chart.register(...registerables);

const ProvinceRainfallChart = () => {
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
    day: 4,  // Ngày có dữ liệu theo API
    startHour: 9,
    endHour: 11
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
      // Mock data với tên chính xác từ API
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

  // Updated function to use correct API format
  const loadRainfallData = async () => {
    if (!selectedProvince) {
      setError('Vui lòng chọn tỉnh');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { year, month, day, startHour, endHour } = timeSelection;
      
      // Sử dụng range API với format chính xác
      const response = await fetch(
        `http://localhost:2004/api/rain-province-time/range?` +
        `province=${encodeURIComponent(selectedProvince)}` +
        `&startYear=${year}&startMonth=${month}&startDay=${day}` +
        `&startHour=${startHour}&endHour=${endHour}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.success && data?.data?.length > 0) {
        // Process the data với cấu trúc API thực tế
        const processedData = data.data.map(item => ({
          ...item,
          hour: parseInt(item.Hour || item.hour || 0),
          value: parseFloat(item.RainValue || 0), // Sử dụng chính xác RainValue từ API
          stationId: item.StationID || item.stationId || item.StationName,
          stationName: item.StationNameVN || item.StationName || item.stationName || `Trạm ${item.StationID || item.stationId}`,
          timestamp: new Date(year, month - 1, day, parseInt(item.Hour || item.hour || 0)),
          latitude: item.Latitude,
          longitude: item.Longitude,
          provinceName: item.ProvinceName
        }));
        
        setRainfallData(processedData);
        renderChart(processedData);
        
        // Update stations list from the data
        const uniqueStations = [...new Map(
          processedData.map(item => [
            item.stationId, 
            { 
              id: item.stationId, 
              name: item.stationName,
              StationID: item.stationId,
              StationName: item.stationName
            }
          ])
        ).values()];
        setStations(uniqueStations);
        
      } else {
        setError('Không có dữ liệu cho tỉnh và thời gian đã chọn');
        setRainfallData([]);
        setStations([]);
      }
      
    } catch (error) {
      console.error('Error loading rainfall data:', error);
      setError('Không thể tải dữ liệu mưa: ' + error.message);
      
      // Fallback to single hour API calls if range API fails
      await loadRainfallDataFallback();
      
    } finally {
      setLoading(false);
    }
  };

  // Fallback method using single hour API calls
  const loadRainfallDataFallback = async () => {
    try {
      const allData = [];
      const { year, month, day, startHour, endHour } = timeSelection;

      console.log('Using fallback method - single hour API calls');

      // Load data for each hour in the selected range
      for (let hour = startHour; hour <= endHour; hour++) {
        try {
          const response = await fetch(
            `http://localhost:2004/api/rain-province-time?` +
            `province=${encodeURIComponent(selectedProvince)}` +
            `&year=${year}&month=${month}&day=${day}&hour=${hour}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data?.success && data?.data?.length > 0) {
              // Process data for this hour với cấu trúc API thực tế
              data.data.forEach(item => {
                allData.push({
                  ...item,
                  hour: hour,
                  value: parseFloat(item.Value || item.RainValue || item.value || item.Rain || 0),
                  stationId: item.StationID || item.stationId || item.StationName,
                  stationName: item.StationNameVN || item.StationName || item.stationName || `Trạm ${item.StationID || item.stationId}`,
                  timestamp: new Date(year, month - 1, day, hour),
                  latitude: item.Latitude,
                  longitude: item.Longitude,
                  provinceName: item.ProvinceName
                });
              });
            }
          }
        } catch (hourError) {
          console.warn(`Error loading data for hour ${hour}:`, hourError);
        }
      }

      if (allData.length > 0) {
        setRainfallData(allData);
        renderChart(allData);
        
        // Update stations list
        const uniqueStations = [...new Map(
          allData.map(item => [
            item.stationId, 
            { 
              id: item.stationId, 
              name: item.stationName,
              StationID: item.stationId,
              StationName: item.stationName
            }
          ])
        ).values()];
        setStations(uniqueStations);
        
        setError(null);
      } else {
        setError('Không có dữ liệu cho tỉnh và thời gian đã chọn');
      }
      
    } catch (error) {
      console.error('Fallback method also failed:', error);
      setError('Không thể tải dữ liệu mưa');
    }
  };

  const renderChart = useCallback((data) => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Group data by station
    const stationGroups = {};
    data.forEach(item => {
      const stationId = item.stationId || item.StationID;
      const stationName = item.stationName || item.StationName || `Trạm ${stationId}`;
      
      if (!stationGroups[stationId]) {
        stationGroups[stationId] = {
          name: stationName,
          data: []
        };
      }
      
      stationGroups[stationId].data.push({
        x: item.hour,
        y: item.value
      });
    });

    // Sort data by hour for each station and remove duplicates
    Object.values(stationGroups).forEach(group => {
      // Remove duplicates and sort
      const uniqueData = group.data.reduce((acc, current) => {
        const existing = acc.find(item => item.x === current.x);
        if (!existing) {
          acc.push(current);
        } else {
          // If duplicate, take the average or the latest value
          existing.y = (existing.y + current.y) / 2;
        }
        return acc;
      }, []);
      
      group.data = uniqueData.sort((a, b) => a.x - b.x);
    });

    // Create datasets for chart
    const datasets = Object.values(stationGroups).map((group, index) => ({
      label: group.name,
      data: group.data,
      borderColor: getRandomColor(index),
      backgroundColor: getRandomColor(index, 0.1),
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6
    }));

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Lượng mưa theo giờ - ${selectedProvince} (${timeSelection.day}/${timeSelection.month}/${timeSelection.year})`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'line'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(context) {
                return `Giờ: ${context[0].parsed.x}:00`;
              },
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} mm`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: timeSelection.startHour,
            max: timeSelection.endHour,
            title: {
              display: true,
              text: 'Giờ trong ngày',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value + ':00';
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
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
          mode: 'index',
          intersect: false
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    });
  }, [selectedProvince, timeSelection]);

  const getRandomColor = (index, alpha = 1) => {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`,
      `rgba(199, 199, 199, ${alpha})`,
      `rgba(83, 102, 255, ${alpha})`,
      `rgba(255, 99, 255, ${alpha})`,
      `rgba(99, 255, 132, ${alpha})`
    ];
    return colors[index % colors.length];
  };

  const handleTimeChange = (field, value) => {
    setTimeSelection(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  return (
    <div className="province-rainfall-chart">
      <div className="chart-header">
        <h2>Biểu đồ lượng mưa theo giờ của tỉnh</h2>
        
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
            <label>Từ giờ:</label>
            <input
              type="number"
              value={timeSelection.startHour}
              onChange={(e) => handleTimeChange('startHour', e.target.value)}
              min="0"
              max="23"
            />
          </div>

          <div className="control-group">
            <label>Đến giờ:</label>
            <input
              type="number"
              value={timeSelection.endHour}
              onChange={(e) => handleTimeChange('endHour', e.target.value)}
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
          <strong>Tỉnh đã chọn:</strong> {selectedProvince}
        </div>
      )}

      {stations.length > 0 && (
        <div className="stations-info">
          <strong>Số trạm có dữ liệu:</strong> {stations.length}
          <span style={{ marginLeft: '15px', fontSize: '0.9em', color: '#666' }}>
            ({stations.map(s => s.name || s.StationName).join(', ')})
          </span>
        </div>
      )}

      {rainfallData.length > 0 && (
        <div className="data-summary">
          <strong>Tổng số điểm dữ liệu:</strong> {rainfallData.length}
          <span style={{ marginLeft: '15px', fontSize: '0.9em', color: '#666' }}>
            Từ {timeSelection.startHour}:00 đến {timeSelection.endHour}:00
          </span>
        </div>
      )}

      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ProvinceRainfallChart;
