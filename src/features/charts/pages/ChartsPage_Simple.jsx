import React, { useState, useEffect } from 'react';
import ProvinceRainfallChart from '../components/ProvinceRainfallChart';
import StationRainfallBarChart from '../components/StationRainfallBarChart';
// import Charts from '../components/Charts'; // Tạm tắt vì có Chart.js
import './ChartsPage.css';

function ChartsPage_Simple({ onGoBack }) {
  const [stations, setStations] = useState([]);
  const [chartType, setChartType] = useState('province'); // 'province' hoặc 'station'

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await fetch('http://localhost:2004/api/provinces');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStations(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  };

  return (
    <div className="charts-page">
      <div className="charts-header">
        <h2>📊 Biểu đồ Lượng mưa</h2>
        <button 
          onClick={onGoBack}
          className="back-button"
        >
          ← Về trang chủ
        </button>
      </div>

      <div className="charts-content">
        {/* Chart Type Selector */}
        <div className="chart-selector">
          <button 
            className={chartType === 'province' ? 'active' : ''}
            onClick={() => setChartType('province')}
          >
            Biểu đồ theo Tỉnh
          </button>
          <button 
            className={chartType === 'station' ? 'active' : ''}
            onClick={() => setChartType('station')}
          >
            Biểu đồ theo Trạm
          </button>
          {/* Tạm tắt tab Summary vì có Charts component phức tạp */}
        </div>

        {/* Chart Display */}
        <div className="chart-section">
          {chartType === 'province' && (
            <div>
              <h3>Biểu đồ Lượng mưa theo Tỉnh</h3>
              <ProvinceRainfallChart />
            </div>
          )}
          
          {chartType === 'station' && (
            <div>
              <h3>Biểu đồ Lượng mưa theo Trạm</h3>
              <StationRainfallBarChart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartsPage_Simple;
