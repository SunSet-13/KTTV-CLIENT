import React, { useState, useEffect } from 'react';
import './App.css';

// Import from new feature-based structure
import { Header, Footer } from './layouts';
import { Hero, Features } from './shared/components';
import { Map, Legend, RainfallControls, MapPage, MapPageKTTV } from './features/map';
import { Charts, ChartsPage } from './features/charts';
import { DataTable, DataQualityAlert } from './features/data-table';
import ErrorBoundary from './ErrorBoundary';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [stations, setStations] = useState([]);
  const [rainfallData, setRainfallData] = useState([]);
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
      
      // Kiểm tra an toàn trước khi set data
      if (result && result.data) {
        setRainfallData(result.data);
      } else {
        // Nếu không có dữ liệu, set array rỗng
        setRainfallData([]);
        console.warn('API không trả về dữ liệu hợp lệ:', result);
      }
      
      if (result && result.qualityReport) {
        setQualityReport(result.qualityReport);
      }
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

  const handleAnimationToggle = () => {
    // Animation feature removed for simplicity
  };

  const navigateToMap = () => {
    setCurrentPage('map');
  };

  const navigateToKTTVMap = () => {
    setCurrentPage('kttvMap');
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
    return (
      <ErrorBoundary>
        <MapPage onGoBack={navigateToHome} />
      </ErrorBoundary>
    );
  }

  // Render trang bản đồ KTTV
  if (currentPage === 'kttvMap') {
    return (
      <ErrorBoundary>
        <MapPageKTTV onGoBack={navigateToHome} />
      </ErrorBoundary>
    );
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
        onKTTVMapClick={navigateToKTTVMap}
        onDataTableClick={navigateToDataTable}
        onChartsClick={navigateToCharts}
        onHomeClick={navigateToHome}
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
        />
        
        <Legend />
        
        <Charts data={rainfallData} stations={stations} />
      </section>
      
      <Footer />
    </div>
  );
}

export default App;
