// Example: Feature-based component structure
// features/weather/components/WeatherMap/WeatherMap.jsx

import React, { useState, useEffect } from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { weatherAPI } from '../../services/weatherAPI';
import './WeatherMap.module.css';

const WeatherMap = ({ selectedProvince, filters }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { data: weatherData, loading: weatherLoading } = useWeatherData(filters);

  const handleProvinceSelect = async (provinceName) => {
    if (!provinceName) return;
    
    setLoading(true);
    try {
      const stationsData = await weatherAPI.getStationsByProvince(provinceName);
      setStations(stationsData);
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProvince) {
      handleProvinceSelect(selectedProvince);
    }
  }, [selectedProvince]);

  return (
    <div className="weather-map">
      <div className="map-container">
        {/* Map component here */}
        {loading && <div className="loading">Đang tải trạm...</div>}
        {stations.length > 0 && (
          <div className="stations-info">
            Hiển thị {stations.length} trạm ở {selectedProvince}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherMap;
