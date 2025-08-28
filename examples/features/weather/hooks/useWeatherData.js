// features/weather/hooks/useWeatherData.js
import { useState, useEffect } from 'react';
import { weatherAPI } from '../services/weatherAPI';

export const useWeatherData = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await weatherAPI.getWeatherData(filters);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [filters.province, filters.startDate, filters.endDate]);

  return { data, loading, error };
};
