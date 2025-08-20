import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage_optimized.css';
import Header from './Header';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapPage({ onGoBack }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().slice(0, 16));

  // Hàm tạo màu sắc theo lượng mưa
  const getColorForRainfall = (val) => {
    return val > 50 ? '#800026' :
           val > 30 ? '#BD0026' :
           val > 20 ? '#E31A1C' :
           val > 10 ? '#FC4E2A' :
           val > 5 ? '#FD8D3C' :
           val > 1 ? '#FEB24C' :
           val > 0 ? '#FED976' : '#FFFFB2';
  };

  // Khởi tạo bản đồ
  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    console.log('Initializing Leaflet map...');
    
    try {
      // Tạo map instance
      mapInstance.current = L.map(mapRef.current, {
        center: [16.0, 108.0],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      });

      // Thêm OpenStreetMap tile layer (đáng tin cậy nhất)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 3
      }).addTo(mapInstance.current);

      // Tạo group cho markers
      markersGroup.current = L.layerGroup().addTo(mapInstance.current);

      console.log('Map initialized successfully');
      
      // Load dữ liệu sau khi map sẵn sàng
      setTimeout(() => {
        loadStations();
      }, 100);

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Không thể khởi tạo bản đồ');
    }
  };

  // Load dữ liệu stations
  const loadStations = async () => {
    console.log('Loading stations data...');
    setLoading(true);
    setError(null);

    try {
      // Thử gọi API trước
      const apiUrl = searchDate 
        ? `http://localhost:2004/api/station-rain?datetime=${encodeURIComponent(searchDate)}`
        : 'http://localhost:2004/api/station-rain';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API data received:', data);
        
        if (data && data.stationRainData && Array.isArray(data.stationRainData)) {
          processApiData(data.stationRainData);
          return;
        }
      }
    } catch (apiError) {
      console.warn('API call failed, using mock data:', apiError);
    }

    // Sử dụng dữ liệu mẫu
    const mockStations = [
      {
        id: 1702001,
        code: '92413',
        name: 'Thuan Quan',
        latitude: 20.564794,
        longitude: 106.422799,
        rainValue: 15.2,
        dateTime: new Date().toISOString()
      },
      {
        id: 2701001,
        code: '868519',
        name: 'Dao Quan Lan',
        latitude: 20.89944,
        longitude: 107.495333,
        rainValue: 8.5,
        dateTime: new Date().toISOString()
      },
      {
        id: 2701301,
        code: '942981',
        name: 'Dao Thang Loi',
        latitude: 20.885694,
        longitude: 107.313944,
        rainValue: 32.1,
        dateTime: new Date().toISOString()
      },
      {
        id: 2603901,
        code: '1026260804',
        name: 'Dak Ro Wa',
        latitude: 14.338111,
        longitude: 108.038356,
        rainValue: 3.8,
        dateTime: new Date().toISOString()
      },
      {
        id: 1102401,
        code: '1026463001',
        name: 'Dak Song 3',
        latitude: 13.665556,
        longitude: 108.707222,
        rainValue: 65.3,
        dateTime: new Date().toISOString()
      },
      {
        id: 3103601,
        code: '272342',
        name: 'Dai Tu',
        latitude: 21.633889,
        longitude: 105.638056,
        rainValue: 0,
        dateTime: new Date().toISOString()
      }
    ];

    processStationsData(mockStations);
    setLoading(false);
  };

  // Xử lý dữ liệu từ API
  const processApiData = (apiData) => {
    const stationsMap = new Map();
    
    apiData.forEach(item => {
      const stationId = item.StationID;
      if (!stationsMap.has(stationId) || new Date(item.DtDate) > new Date(stationsMap.get(stationId).DtDate)) {
        stationsMap.set(stationId, {
          id: item.StationID,
          code: item.StationNo,
          name: item.StationName,
          latitude: item.Latitude,
          longitude: item.Longitude,
          rainValue: item.RainValue,
          dateTime: item.DtDate
        });
      }
    });
    
    const stationsArray = Array.from(stationsMap.values());
    processStationsData(stationsArray);
    setLoading(false);
  };

  // Xử lý và hiển thị dữ liệu stations
  const processStationsData = (stationsData) => {
    console.log('Processing stations data:', stationsData.length, 'stations');
    
    // Lọc theo tìm kiếm
    const filtered = searchId 
      ? stationsData.filter(station => 
          station.code.toLowerCase().includes(searchId.toLowerCase()) ||
          station.name.toLowerCase().includes(searchId.toLowerCase())
        )
      : stationsData;
    
    setStations(stationsData);
    setFilteredStations(filtered);
    
    // Hiển thị trên bản đồ
    displayMarkers(filtered);
  };

  // Hiển thị markers trên bản đồ
  const displayMarkers = (stationsData) => {
    if (!mapInstance.current || !markersGroup.current) {
      console.warn('Map or markers group not ready');
      return;
    }

    console.log('Displaying markers for', stationsData.length, 'stations');
    
    // Xóa markers cũ
    markersGroup.current.clearLayers();
    
    const bounds = [];

    stationsData.forEach((station, index) => {
      const lat = parseFloat(station.latitude);
      const lon = parseFloat(station.longitude);
      
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        console.warn('Invalid coordinates for station:', station.name, lat, lon);
        return;
      }

      const rainValue = parseFloat(station.rainValue) || 0;
      const color = getColorForRainfall(rainValue);
      
      // Tạo circle marker
      const circleMarker = L.circleMarker([lat, lon], {
        radius: Math.max(6, Math.min(rainValue * 0.3 + 6, 20)),
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Hover effect
      circleMarker.on('mouseover', function() {
        this.setStyle({ fillOpacity: 1, weight: 3 });
      });

      circleMarker.on('mouseout', function() {
        this.setStyle({ fillOpacity: 0.8, weight: 2 });
      });
      
      // Popup
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #007acc;">${station.name}</h4>
          <p style="margin: 3px 0;"><strong>Mã trạm:</strong> ${station.code}</p>
          <p style="margin: 3px 0;"><strong>ID:</strong> ${station.id}</p>
          <p style="margin: 3px 0;"><strong>Tọa độ:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
          <p style="margin: 3px 0;"><strong>Lượng mưa:</strong> 
            <span style="color: ${color}; font-weight: bold; font-size: 16px;">${rainValue} mm</span>
          </p>
          <p style="margin: 3px 0;"><strong>Cập nhật:</strong> ${new Date(station.dateTime).toLocaleString('vi-VN')}</p>
        </div>
      `;
      
      circleMarker.bindPopup(popupContent);
      circleMarker.addTo(markersGroup.current);
      
      bounds.push([lat, lon]);
      
      console.log(`Added marker ${index + 1}: ${station.name} at [${lat}, ${lon}] with ${rainValue}mm`);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      setTimeout(() => {
        if (mapInstance.current) {
          const group = new L.featureGroup(markersGroup.current.getLayers());
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }
      }, 100);
    }
  };

  // Event handlers
  const handleSearch = () => {
    loadStations();
  };

  const handleClearSearch = () => {
    setSearchId('');
    setSearchDate(new Date().toISOString().slice(0, 16));
    loadStations();
  };

  // Initialize map on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
      }
    };
  }, []); // Empty dependency array is intentional - only run once on mount

  // Legend component
  const RainfallLegend = () => {
    const grades = [0, 1, 5, 10, 20, 30, 50];
    
    return (
      <div className="rainfall-legend">
        <h4>Chú giải lượng mưa (mm)</h4>
        {grades.map((grade, index) => {
          const from = grade;
          const to = grades[index + 1];
          const color = getColorForRainfall(grade);
          
          return (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: color }}
              ></div>
              <span>{from}{to ? `–${to}` : '+'}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="map-page">
      <Header />
      
      <div className="map-header">
        <h2>Bản đồ lượng mưa các trạm KTTV</h2>
        <button onClick={onGoBack} className="back-button">← Quay lại</button>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã trạm hoặc tên trạm..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="search-input"
          />
          <input
            type="datetime-local"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="date-input"
          />
          <button onClick={handleSearch} className="search-button" disabled={loading}>
            🔍 Tìm kiếm
          </button>
          <button onClick={handleClearSearch} className="clear-button">
            🗑️ Xóa
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div>
          {loading && <span className="status-loading">🔄 Đang tải dữ liệu...</span>}
          {error && <span className="status-error">⚠️ {error}</span>}
          {!loading && !error && (
            <span className="status-success">
              ✅ Hiển thị {filteredStations.length}/{stations.length} trạm
            </span>
          )}
        </div>
        <div className="map-controls">
          <button onClick={loadStations} disabled={loading} className="reload-button">
            🔄 Tải lại
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="map-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="map-leaflet" 
          style={{ 
            height: '500px', 
            width: '100%',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc'
          }} 
        />
        
        {/* Legend */}
        <div className="map-legend">
          <RainfallLegend />
        </div>
      </div>
    </div>
  );
}

export default MapPage;
