import React, { useState, useEffect } from 'react';
import Charts from '../components/Charts';
import { RainfallControls, Map, Legend } from '../../map';
import { DataQualityAlert } from '../../data-table';
import { Header } from '../../../layouts';
import './ChartsPage.css';

function ChartsPage({ onGoBack }) {
  const [rainfallData, setRainfallData] = useState([]);
  const [stations, setStations] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);
  const [viewMode, setViewMode] = useState('points');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      // Sử dụng API đã hoạt động thay vì API không tồn tại
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

      // Sử dụng API đã hoạt động
      const response = await fetch(`http://localhost:2004/api/station-rain?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setRainfallData(data.stationRainData || []);
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
    try {
      const format = window.confirm('Bạn muốn xuất dữ liệu dạng Excel (OK) hay PDF (Cancel)?') ? 'excel' : 'pdf';
      // Tạo file export cục bộ vì API chưa có
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Station,Time,Value\n"
        + rainfallData.map(row => `${row.stationName},${row.timestamp},${row.value}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rainfall_data.${format === 'excel' ? 'csv' : 'txt'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Lỗi xuất dữ liệu:', error);
      alert('Có lỗi khi xuất dữ liệu');
    }
  };

  const handleModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAnimationToggle = () => {
    // Animation feature removed for simplicity
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
          />
          
          <Legend />
          
          <Charts data={rainfallData} stations={stations} />
        </section>
      </div>
    </div>
  );
}

export default ChartsPage;
