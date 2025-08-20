import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function Map({ data, viewMode, animationData, isAnimating }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Khởi tạo bản đồ
      mapInstanceRef.current = L.map(mapRef.current).setView([10.8, 106.6], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && data) {
      clearMarkers();
      
      if (viewMode === 'points') {
        displayDataPoints(data);
      } else if (viewMode === 'contour') {
        displayContourLines(data);
      }
    }
  }, [data, viewMode]);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];
  };

  const displayDataPoints = (rainfallData) => {
    // Nhóm dữ liệu theo trạm
    const stationData = {};
    rainfallData.forEach(item => {
      if (!stationData[item.stationId]) {
        stationData[item.stationId] = {
          station: item,
          data: []
        };
      }
      stationData[item.stationId].data.push(item);
    });

    Object.values(stationData).forEach(station => {
      const avgRainfall = station.data.reduce((sum, item) => sum + item.value, 0) / station.data.length;
      
      const marker = L.circleMarker([station.station.latitude, station.station.longitude], {
        radius: 8,
        fillColor: getColorForRainfall(avgRainfall),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(createStationPopup(station.station, station.data));
      markersRef.current.push(marker);
    });
  };

  const displayContourLines = (contourData) => {
    // Hiển thị đường đẳng trị (cần dữ liệu contour từ API)
    if (contourData && contourData.length > 0) {
      const geojson = {
        type: 'FeatureCollection',
        features: contourData.map(contour => ({
          type: 'Feature',
          properties: { value: contour.value },
          geometry: {
            type: 'LineString',
            coordinates: contour.coordinates.map(coord => [coord.longitude, coord.latitude])
          }
        }))
      };

      const contourLayer = L.geoJSON(geojson, {
        style: (feature) => ({
          color: getColorForRainfall(feature.properties.value),
          weight: 2,
          opacity: 0.8
        }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`Lượng mưa: ${feature.properties.value} mm`);
        }
      }).addTo(mapInstanceRef.current);

      markersRef.current.push(contourLayer);
    }
  };

  const createStationPopup = (station, data) => {
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    return `
      <b>${station.stationName || station.name}</b><br>
      Mã trạm: ${station.code || 'N/A'}<br>
      Vị trí: ${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}<br><br>
      <b>Thống kê:</b><br>
      - Lượng mưa TB: ${avg.toFixed(1)} mm<br>
      - Lượng mưa lớn nhất: ${max.toFixed(1)} mm<br>
      - Lượng mưa nhỏ nhất: ${min.toFixed(1)} mm<br>
      - Tổng lượng mưa: ${sum.toFixed(1)} mm
    `;
  };

  const getColorForRainfall = (val) => {
    return val > 50 ? '#800026' :
           val > 30 ? '#BD0026' :
           val > 20 ? '#E31A1C' :
           val > 10 ? '#FC4E2A' :
           val > 5 ? '#FD8D3C' :
           val > 1 ? '#FEB24C' :
           val > 0 ? '#FED976' : '#FFFFB2';
  };

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default Map;
