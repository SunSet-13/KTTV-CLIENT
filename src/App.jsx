import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import RainfallControls from './components/RainfallControls';
import Map from './components/Map';
import Legend from './components/Legend';
import Charts from './components/Charts';
import DataQualityAlert from './components/DataQualityAlert';
import MapPage from './components/MapPage';
import DataTable from './components/DataTable';
import ChartsPage from './components/ChartsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [stations, setStations] = useState([]);
  const [rainfallData, setRainfallData] = useState([]);
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
        { id: 1, name: 'Trạm Tân Sơn Nhất', code: 'TSN', latitude: 10.8187, longitude: 106.6582 },
        { id: 2, name: 'Trạm Biên Hòa', code: 'BH', latitude: 10.9450, longitude: 106.8240 },
        { id: 3, name: 'Trạm Vũng Tàu', code: 'VT', latitude: 10.3460, longitude: 107.0840 },
        { id: 4, name: 'Trạm Cần Thơ', code: 'CT', latitude: 10.0452, longitude: 105.7469 },
        { id: 5, name: 'Trạm Hà Nội', code: 'HN', latitude: 21.0285, longitude: 105.8542 }
      ];
      setStations(mockStations);
    }
  };

  const handleFilterChange = async (filters) => {
    try {
      let url = `/api/rainfall/hourly?startDate=${filters.startDate}&endDate=${filters.endDate}`;
      if (filters.stationId) url += `&stationId=${filters.stationId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      setRainfallData(result.data);
      setQualityReport(result.qualityReport);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      // Tạo dữ liệu mẫu từ stations hiện có
      const generateMockData = () => {
        const mockData = [];
        const startTime = new Date(filters.startDate);
        const endTime = new Date(filters.endDate);
        
        stations.forEach(station => {
          for (let time = new Date(startTime); time <= endTime; time.setHours(time.getHours() + 3)) {
            mockData.push({
              id: `${station.id}_${time.getTime()}`,
              stationId: station.id,
              stationName: station.name,
              stationCode: station.code,
              latitude: station.latitude,
              longitude: station.longitude,
              value: Math.round((Math.random() * 50) * 10) / 10,
              time: new Date(time).toISOString(),
              timestamp: new Date(time)
            });
          }
        });
        return mockData;
      };
      
      const sampleData = generateMockData();
      setRainfallData(sampleData);
      setQualityReport({ 
        totalRecords: sampleData.length, 
        missingDataCount: 0, 
        invalidDataCount: 0, 
        missingDataStations: [] 
      });
    }
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

  const navigateToMap = () => {
    setCurrentPage('map');
  };

  const navigateToDataTable = () => {
    setCurrentPage('dataTable');
  };

  const navigateToCharts = () => {
    setCurrentPage('charts');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  // Render trang bản đồ nếu currentPage là 'map'
  if (currentPage === 'map') {
    return <MapPage onGoBack={navigateToHome} />;
  }

  // Render trang truy xuất dữ liệu
  if (currentPage === 'dataTable') {
    return <DataTable onGoBack={navigateToHome} />;
  }

  // Render trang biểu đồ & thống kê
  if (currentPage === 'charts') {
    return <ChartsPage onGoBack={navigateToHome} />;
  }

  return (
    <div className="App">
      <Header 
        onMapClick={navigateToMap}
        onDataTableClick={navigateToDataTable}
        onChartsClick={navigateToCharts}
      />
      <Hero />
      <Features />
      
      <section className="section">
        <h2>Tra cứu lượng mưa</h2>
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
      
      <Footer />
    </div>
  );
}

export default App;
