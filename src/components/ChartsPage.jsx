import React, { useState, useEffect } from 'react';
import Charts from './Charts';
import RainfallControls from './RainfallControls';
import DataQualityAlert from './DataQualityAlert';
import Map from './Map';
import Legend from './Legend';
import Header from './Header';
import './ChartsPage.css';

function ChartsPage({ onGoBack }) {
  const [rainfallData, setRainfallData] = useState([]);
  const [stations, setStations] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);
  const [viewMode, setViewMode] = useState('points');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await fetch('/api/rainfall/stations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách trạm:', error);
      // Dữ liệu mẫu khi không có API
      const mockStations = [
        { id: 1, code: 'HN001', name: 'Hà Nội', latitude: 21.0285, longitude: 105.8542 },
        { id: 2, code: 'HCM001', name: 'TP.HCM', latitude: 10.8231, longitude: 106.6297 },
        { id: 3, code: 'DN001', name: 'Đà Nẵng', latitude: 16.0471, longitude: 108.2068 },
        { id: 4, code: 'CT001', name: 'Cần Thơ', latitude: 10.0452, longitude: 105.7469 },
        { id: 5, code: 'HP001', name: 'Hải Phòng', latitude: 20.8449, longitude: 106.6881 }
      ];
      setStations(mockStations);
    }
  };

  const handleFilterChange = async (filters) => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        ...(filters.stationId && { stationId: filters.stationId })
      });

      const response = await fetch(`/api/rainfall/hourly?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setRainfallData(data.data || []);
      setQualityReport(data.qualityReport || null);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      // Dữ liệu mẫu khi không có API
      const mockData = generateMockData(filters);
      setRainfallData(mockData);
      setQualityReport({
        totalRecords: mockData.length,
        missingDataCount: 0,
        invalidDataCount: 0,
        missingDataStations: []
      });
    }
  };

  const generateMockData = (filters) => {
    const data = [];
    const startTime = new Date(filters.startDate);
    const endTime = new Date(filters.endDate);
    
    stations.forEach(station => {
      for (let time = startTime; time <= endTime; time.setHours(time.getHours() + 1)) {
        data.push({
          id: `${station.id}_${time.getTime()}`,
          stationId: station.id,
          stationCode: station.code,
          stationName: station.name,
          latitude: station.latitude,
          longitude: station.longitude,
          timestamp: new Date(time),
          value: Math.random() * 50,
          quality: Math.random() > 0.1 ? 'good' : 'poor'
        });
      }
    });
    
    return data;
  };

  const handleExportData = () => {
    const format = window.confirm('Bạn muốn xuất dữ liệu dạng Excel (OK) hay PDF (Cancel)?') ? 'excel' : 'pdf';
    const url = `/api/rainfall/export?format=${format}`;
    window.open(url, '_blank');
  };

  const handleModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAnimationToggle = (animating) => {
    setIsAnimating(animating);
  };

  return (
    <div className="charts-page">
      <Header />
      <div className="charts-header">
        <h2>Biểu đồ & Thống kê</h2>
        <button className="back-button" onClick={onGoBack}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>

      <div className="charts-content">
        <section className="section">
          <h3>Tra cứu lượng mưa</h3>
          <RainfallControls
            onFilterChange={handleFilterChange}
            onExportData={handleExportData}
            onModeChange={handleModeChange}
            onAnimationToggle={handleAnimationToggle}
          />
          
          <DataQualityAlert report={qualityReport} />
          
          <Map 
            data={rainfallData} 
            viewMode={viewMode}
            animationData={[]}
            isAnimating={isAnimating}
          />
          
          <Legend />
          
          <Charts data={rainfallData} stations={stations} />
        </section>
      </div>
    </div>
  );
}

export default ChartsPage;
