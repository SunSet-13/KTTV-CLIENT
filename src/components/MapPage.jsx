import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
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
  const [searchDay, setSearchDay] = useState('');
  const [searchMonth, setSearchMonth] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchHour, setSearchHour] = useState('');
  const [showOnlyRainy, setShowOnlyRainy] = useState(false);
  const [minRainfall, setMinRainfall] = useState(0);

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

  // Load dữ liệu stations với lọc theo thời gian
  const loadStations = async () => {
    // Kiểm tra và tạo datetime từ 4 ô input
    let queryDateTime = '';
    if (searchDay && searchMonth && searchYear) {
      const day = searchDay.toString().padStart(2, '0');
      const month = searchMonth.toString().padStart(2, '0');
      const year = searchYear.toString();
      const hour = searchHour ? searchHour.toString().padStart(2, '0') : '00';
      
      queryDateTime = `${year}-${month}-${day}T${hour}:00`;
    }
    
    console.log('Loading stations data for datetime:', queryDateTime);
    setLoading(true);
    setError(null);

    try {
      // Gọi API với datetime parameter nếu có
      let apiUrl = 'http://localhost:2004/api/station-rain';
      if (queryDateTime) {
        apiUrl += `?datetime=${encodeURIComponent(queryDateTime)}`;
      }
      
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', {
          hasStationRainData: !!data.stationRainData,
          dataLength: data.stationRainData?.length || 0,
          count: data.count,
          firstItem: data.stationRainData?.[0]
        });
        
        if (data && data.stationRainData && Array.isArray(data.stationRainData) && data.stationRainData.length > 0) {
          processApiData(data.stationRainData);
          return;
        } else {
          console.warn('No data returned from API');
          setError('Không có dữ liệu cho thời gian đã chọn');
        }
      } else {
        console.error('API response not OK:', response.status, response.statusText);
        setError(`API error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.error('API call failed:', apiError);
      setError(`Không thể kết nối API: ${apiError.message}`);
    }

    // Không sử dụng mock data nữa, chỉ dựa vào API
    setStations([]);
    setFilteredStations([]);
    setLoading(false);
  };

  // Xử lý dữ liệu từ API
  const processApiData = (apiData) => {
    console.log('=== PROCESSING API DATA ===');
    console.log('Raw API data length:', apiData.length);
    console.log('First 3 raw items:', apiData.slice(0, 3));
    
    // Nhóm dữ liệu theo StationID để lấy bản ghi mới nhất
    const stationsMap = new Map();
    let processedCount = 0;
    let validCoordCount = 0;
    
    apiData.forEach((item, index) => {
      processedCount++;
      const stationId = item.StationID;
      const itemDate = new Date(item.DtDate);
      
      // Chỉ lấy bản ghi mới nhất cho mỗi trạm
      if (!stationsMap.has(stationId) || 
          itemDate > new Date(stationsMap.get(stationId).DtDate)) {
        
        // Kiểm tra tọa độ hợp lệ
        const lat = parseFloat(item.Latitude);
        const lon = parseFloat(item.Longitude);
        
        if (!isNaN(lat) && !isNaN(lon) && 
            lat >= -90 && lat <= 90 && 
            lon >= -180 && lon <= 180 &&
            lat !== 0 && lon !== 0) { // Loại bỏ tọa độ (0,0)
          
          validCoordCount++;
          
          stationsMap.set(stationId, {
            id: item.StationID,
            code: item.StationNo || 'N/A',
            name: item.StationName || 'Unknown',
            latitude: lat,
            longitude: lon,
            rainValue: parseFloat(item.RainValue) || 0,
            dateTime: item.DtDate
          });
        } else {
          console.warn('Invalid coordinates for station:', item.StationName, lat, lon);
        }
      } else {
        console.log(`Skipping older record for station ${stationId}`);
      }
    });
    
    const stationsArray = Array.from(stationsMap.values());
    console.log('=== PROCESSING RESULTS ===');
    console.log('Processed count:', processedCount);
    console.log('Valid coordinates:', validCoordCount);
    console.log('Final unique stations:', stationsArray.length);
    console.log('Stations with rain > 0:', stationsArray.filter(s => s.rainValue > 0).length);
    console.log('=== END PROCESSING ===');
    
    processStationsData(stationsArray);
    setLoading(false);
  };

  // Xử lý và hiển thị dữ liệu stations với các bộ lọc
  const processStationsData = (stationsData) => {
    console.log('Processing stations data:', stationsData.length, 'stations');
    
    // Lọc theo các tiêu chí
    let filtered = stationsData;
    
    // Lọc theo tìm kiếm ID/tên trạm
    if (searchId) {
      filtered = filtered.filter(station => 
        station.code.toLowerCase().includes(searchId.toLowerCase()) ||
        station.name.toLowerCase().includes(searchId.toLowerCase())
      );
    }
    
    // Lọc theo lượng mưa (chỉ hiện trạm có mưa > ngưỡng)
    if (showOnlyRainy) {
      filtered = filtered.filter(station => parseFloat(station.rainValue) > minRainfall);
    }
    
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
    let markersAdded = 0;

    stationsData.forEach((station, index) => {
      const lat = parseFloat(station.latitude);
      const lon = parseFloat(station.longitude);
      
      // Kiểm tra tọa độ nghiêm ngặt
      if (isNaN(lat) || isNaN(lon) || 
          lat < -90 || lat > 90 || 
          lon < -180 || lon > 180 ||
          (lat === 0 && lon === 0)) {
        console.warn(`Station ${station.name} has invalid coordinates: [${lat}, ${lon}]`);
        return;
      }

      const rainValue = parseFloat(station.rainValue) || 0;
      const color = getColorForRainfall(rainValue);
      
      // Tạo circle marker với kích thước phù hợp
      const radius = rainValue > 0 ? Math.max(8, Math.min(rainValue * 0.5 + 8, 25)) : 6;
      
      const circleMarker = L.circleMarker([lat, lon], {
        radius: radius,
        fillColor: color,
        color: rainValue > 0 ? '#ffffff' : '#666666',
        weight: rainValue > 0 ? 2 : 1,
        opacity: 1,
        fillOpacity: rainValue > 0 ? 0.8 : 0.6
      });

      // Hover effect
      circleMarker.on('mouseover', function() {
        this.setStyle({ 
          fillOpacity: 1, 
          weight: 3,
          radius: radius + 2
        });
      });

      circleMarker.on('mouseout', function() {
        this.setStyle({ 
          fillOpacity: rainValue > 0 ? 0.8 : 0.6, 
          weight: rainValue > 0 ? 2 : 1,
          radius: radius
        });
      });
      
      // Popup với thông tin chi tiết
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 220px;">
          <h4 style="margin: 0 0 8px 0; color: #007acc; font-size: 16px;">${station.name}</h4>
          <p style="margin: 3px 0; font-size: 14px;"><strong>Mã trạm:</strong> ${station.code}</p>
          <p style="margin: 3px 0; font-size: 14px;"><strong>ID:</strong> ${station.id}</p>
          <p style="margin: 3px 0; font-size: 14px;"><strong>Tọa độ:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
          <p style="margin: 3px 0; font-size: 14px;"><strong>Lượng mưa:</strong> 
            <span style="color: ${color}; font-weight: bold; font-size: 18px;">${rainValue.toFixed(1)} mm</span>
          </p>
          <p style="margin: 3px 0; font-size: 12px; color: #666;"><strong>Thời gian:</strong> ${new Date(station.dateTime).toLocaleString('vi-VN')}</p>
        </div>
      `;
      
      circleMarker.bindPopup(popupContent);
      circleMarker.addTo(markersGroup.current);
      
      bounds.push([lat, lon]);
      markersAdded++;
      
      if (index < 10) { // Log first 10 markers for debugging
        console.log(`Marker ${index + 1}: ${station.name} at [${lat}, ${lon}] with ${rainValue}mm`);
      }
    });

    console.log(`Successfully added ${markersAdded} markers to map`);

    // Fit map to show all markers với padding
    if (bounds.length > 0) {
      setTimeout(() => {
        if (mapInstance.current) {
          try {
            const group = new L.featureGroup(markersGroup.current.getLayers());
            if (group.getBounds().isValid()) {
              mapInstance.current.fitBounds(group.getBounds().pad(0.1));
            } else {
              // Default view nếu bounds không hợp lệ
              mapInstance.current.setView([16.0, 108.0], 6);
            }
          } catch (error) {
            console.warn('Error fitting bounds:', error);
            mapInstance.current.setView([16.0, 108.0], 6);
          }
        }
      }, 200);
    } else {
      // Set default view if no markers
      mapInstance.current.setView([16.0, 108.0], 6);
    }
  };

  // Event handlers
  const handleSearch = () => {
    loadStations();
  };

  const handleClearSearch = () => {
    setSearchId('');
    setSearchDay('');
    setSearchMonth('');
    setSearchYear('');
    setSearchHour('');
    setShowOnlyRainy(false);
    setMinRainfall(0);
    loadStations();
  };

  const handleToggleRainyOnly = () => {
    setShowOnlyRainy(!showOnlyRainy);
    // Áp dụng lại bộ lọc
    setTimeout(() => processStationsData(stations), 0);
  };

  const handleMinRainfallChange = (value) => {
    setMinRainfall(value);
    // Áp dụng lại bộ lọc
    setTimeout(() => processStationsData(stations), 0);
  };

  // Initialize map on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          
          {/* Date Time Controls */}
          <div className="datetime-controls">
            <input
              type="number"
              placeholder="Ngày"
              value={searchDay}
              onChange={(e) => setSearchDay(e.target.value)}
              className="datetime-input"
              min="1"
              max="31"
              title="Nhập ngày (1-31)"
            />
            <input
              type="number"
              placeholder="Tháng"
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              className="datetime-input"
              min="1"
              max="12"
              title="Nhập tháng (1-12)"
            />
            <input
              type="number"
              placeholder="Năm"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              className="datetime-input year-input"
              min="2020"
              max="2030"
              title="Nhập năm (2020-2030)"
            />
            <input
              type="number"
              placeholder="Giờ"
              value={searchHour}
              onChange={(e) => setSearchHour(e.target.value)}
              className="datetime-input"
              min="0"
              max="23"
              title="Nhập giờ (0-23)"
            />
          </div>
          <label className="filter-label">
            <input
              type="checkbox"
              checked={showOnlyRainy}
              onChange={handleToggleRainyOnly}
              className="checkbox-input"
            />
            Chỉ hiện trạm có mưa {'>'} 
            <input
              type="number"
              value={minRainfall}
              onChange={(e) => handleMinRainfallChange(parseFloat(e.target.value) || 0)}
              className="number-input"
              min="0"
              step="0.1"
              style={{ width: '60px', marginLeft: '5px' }}
            />
            mm
          </label>
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
              {showOnlyRainy && ` (lọc mưa > ${minRainfall}mm)`}
              {(searchDay || searchMonth || searchYear || searchHour) && 
                ` - Thời gian: ${searchDay || 'DD'}/${searchMonth || 'MM'}/${searchYear || 'YYYY'} ${searchHour || '00'}:00`}
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
          
          {/* Thống kê nhanh */}
          {stations.length > 0 && (
            <div className="rainfall-stats">
              <h4>Thống kê</h4>
              <div className="stat-item">
                <span>Tổng trạm: {stations.length}</span>
              </div>
              <div className="stat-item">
                <span>Có mưa: {stations.filter(s => parseFloat(s.rainValue) > 0).length}</span>
              </div>
              <div className="stat-item">
                <span>Không mưa: {stations.filter(s => parseFloat(s.rainValue) === 0).length}</span>
              </div>
              <div className="stat-item">
                <span>Mưa lớn {'>'} 10mm: {stations.filter(s => parseFloat(s.rainValue) > 10).length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
