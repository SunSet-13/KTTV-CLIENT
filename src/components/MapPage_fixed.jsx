import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import Header from './Header';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Các style bản đồ khác nhau
const mapStyles = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'Sáng'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'Tối'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    name: 'Vệ tinh'
  },
  terrain: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'Địa hình'
  }
};

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

function MapPage({ onGoBack }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [searchId, setSearchId] = useState('');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().slice(0, 16));

  // Hàm hiển thị stations trên bản đồ
  const displayStationsOnMap = (stationsData) => {
    if (!mapInstanceRef.current || !stationsData) return;

    // Xóa markers cũ nếu có
    if (markersLayerRef.current) {
      mapInstanceRef.current.removeLayer(markersLayerRef.current);
    }

    // Tạo layer group mới cho markers
    const newMarkersLayer = L.layerGroup().addTo(mapInstanceRef.current);
    markersLayerRef.current = newMarkersLayer;
    
    const bounds = L.latLngBounds();

    stationsData.forEach((station) => {
      const lat = parseFloat(station.latitude);
      const lon = parseFloat(station.longitude);
      
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        const rainValue = station.rainValue || 0;
        const color = getColorForRainfall(rainValue);
        
        // Tạo circle marker với màu sắc theo lượng mưa
        const circleMarker = L.circleMarker([lat, lon], {
          radius: rainValue > 0 ? Math.min(8 + rainValue * 0.2, 15) : 6,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        // Thêm hiệu ứng hover
        circleMarker.on('mouseover', function() {
          this.setStyle({
            radius: this.options.radius + 2,
            weight: 3,
            fillOpacity: 1
          });
        });

        circleMarker.on('mouseout', function() {
          this.setStyle({
            radius: this.options.radius - 2,
            weight: 2,
            fillOpacity: 0.8
          });
        });
        
        // Popup với thông tin chi tiết
        const popupContent = `
          <div style="font-family: Arial; min-width: 250px;">
            <h4 style="margin: 0 0 10px 0; color: #007acc;">${station.name}</h4>
            <p style="margin: 5px 0;"><strong>Mã trạm:</strong> ${station.code}</p>
            <p style="margin: 5px 0;"><strong>ID:</strong> ${station.id}</p>
            <p style="margin: 5px 0;"><strong>Vĩ độ:</strong> ${lat.toFixed(6)}</p>
            <p style="margin: 5px 0;"><strong>Kinh độ:</strong> ${lon.toFixed(6)}</p>
            <p style="margin: 5px 0;"><strong>Lượng mưa:</strong> 
              <span style="color: ${color}; font-weight: bold;">${rainValue} mm</span>
            </p>
            <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${new Date(station.dateTime).toLocaleString('vi-VN')}</p>
          </div>
        `;
        
        circleMarker.bindPopup(popupContent);
        circleMarker.addTo(newMarkersLayer);
        
        bounds.extend([lat, lon]);
      }
    });

    // Fit view tất cả trạm
    if (bounds.isValid() && stationsData.length > 0) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      }, 300);
    }
  };

  // Hàm tải dữ liệu stations
  const loadStations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API với datetime nếu có
      const apiUrl = searchDate 
        ? `http://localhost:2004/api/station-rain?datetime=${encodeURIComponent(searchDate)}`
        : 'http://localhost:2004/api/station-rain';
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.stationRainData && Array.isArray(data.stationRainData)) {
        // Nhóm dữ liệu theo StationID để lấy thông tin trạm và lượng mưa mới nhất
        const stationsMap = new Map();
        
        data.stationRainData.forEach(item => {
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
        
        // Lọc theo ID nếu có tìm kiếm
        const filtered = searchId 
          ? stationsArray.filter(station => 
              station.code.toLowerCase().includes(searchId.toLowerCase()) ||
              station.name.toLowerCase().includes(searchId.toLowerCase())
            )
          : stationsArray;
        
        setStations(stationsArray);
        setFilteredStations(filtered);
        
        // Hiển thị markers trên bản đồ
        displayStationsOnMap(filtered);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      setError(error.message);
      
      // Sử dụng dữ liệu mẫu khi không có API
      const mockStations = [
        {
          id: 1702001,
          code: '92413',
          name: 'Thuan Quan',
          latitude: 20.564794,
          longitude: 106.422799,
          rainValue: Math.round(Math.random() * 50 * 10) / 10,
          dateTime: new Date().toISOString()
        },
        {
          id: 2701001,
          code: '868519',
          name: 'Dao Quan Lan',
          latitude: 20.89944,
          longitude: 107.495333,
          rainValue: Math.round(Math.random() * 50 * 10) / 10,
          dateTime: new Date().toISOString()
        },
        {
          id: 2701301,
          code: '942981',
          name: 'Dao Thang Loi',
          latitude: 20.885694,
          longitude: 107.313944,
          rainValue: Math.round(Math.random() * 50 * 10) / 10,
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
          rainValue: 4.2,
          dateTime: new Date().toISOString()
        }
      ];
      
      const filtered = searchId 
        ? mockStations.filter(station => 
            station.code.toLowerCase().includes(searchId.toLowerCase()) ||
            station.name.toLowerCase().includes(searchId.toLowerCase())
          )
        : mockStations;
      
      setStations(mockStations);
      setFilteredStations(filtered);
      displayStationsOnMap(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadStations();
  };

  const handleClearSearch = () => {
    setSearchId('');
    setSearchDate(new Date().toISOString().slice(0, 16));
    setTimeout(() => loadStations(), 100);
  };

  const changeMapStyle = (styleName) => {
    if (mapInstanceRef.current && mapStyles[styleName]) {
      // Xóa layer cũ
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      
      // Thêm layer mới
      const style = mapStyles[styleName];
      L.tileLayer(style.url, {
        attribution: style.attribution,
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 1,
        continuousWorld: false,
        noWrap: false,
        detectRetina: true,
        crossOrigin: true
      }).addTo(mapInstanceRef.current);
      
      setMapStyle(styleName);

      // Refresh map display
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  };

  // Khởi tạo bản đồ
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      console.log('Initializing map...');
      
      // Tạo bản đồ
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [16.0, 108.0],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });
      
      // Thêm tile layer mặc định
      const style = mapStyles[mapStyle];
      const tileLayer = L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: 19,
        minZoom: 1,
        detectRetina: true,
        crossOrigin: true
      });

      tileLayer.on('load', () => {
        console.log('Map tiles loaded successfully');
      });

      tileLayer.on('tileerror', (error) => {
        console.warn('Tile loading error:', error);
      });

      tileLayer.addTo(mapInstanceRef.current);

      // Fix lỗi hiển thị tiles
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          console.log('Map initialized and invalidated');
          
          // Load dữ liệu sau khi bản đồ được khởi tạo
          loadStations();
        }
      }, 500);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []); // Chỉ chạy một lần khi component mount

  // Component chú giải màu sắc
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

      {/* Thanh tìm kiếm */}
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

      <div className="status-bar">
        <div>
          {loading && <span className="status-loading">🔄 Đang tải...</span>}
          {error && <span className="status-error">⚠️ Lỗi kết nối API, sử dụng dữ liệu mẫu</span>}
          {!loading && (
            <span className="status-success">
              ✅ Hiển thị {filteredStations.length}/{stations.length} trạm
            </span>
          )}
        </div>
        <div className="map-controls">
          <select 
            value={mapStyle} 
            onChange={(e) => changeMapStyle(e.target.value)}
            className="map-style-selector"
          >
            {Object.entries(mapStyles).map(([key, style]) => (
              <option key={key} value={key}>{style.name}</option>
            ))}
          </select>
          <button onClick={loadStations} disabled={loading} className="reload-button">
            🔄 Tải lại
          </button>
        </div>
      </div>

      <div className="map-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div ref={mapRef} className="map-leaflet" style={{ height: '500px', width: '100%' }} />
        
        {/* Chú giải */}
        <div className="map-legend">
          <RainfallLegend />
        </div>
      </div>
    </div>
  );
}

export default MapPage;
