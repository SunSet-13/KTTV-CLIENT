// shared/utils/constants.js

// API Endpoints
export const API_ENDPOINTS = {
  WEATHER: '/weather',
  STATIONS: '/stations', 
  PROVINCES: '/provinces',
  RAINFALL: '/rainfall',
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [14.0583, 108.2772], // Vietnam center
  DEFAULT_ZOOM: 6,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  CHARTS: '/charts',
  MAP: '/map',
  MAP_KTTV: '/map-kttv',
  ABOUT: '/about',
};

// Weather Data Types
export const WEATHER_TYPES = {
  RAINFALL: 'rainfall',
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  WIND: 'wind',
};

// Color Schemes
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
};

// Rainfall Levels (mm)
export const RAINFALL_LEVELS = {
  LIGHT: { min: 0, max: 10, color: '#bfdbfe', label: 'Nhỏ' },
  MODERATE: { min: 10, max: 35, color: '#60a5fa', label: 'Vừa' },
  HEAVY: { min: 35, max: 100, color: '#3b82f6', label: 'To' },
  VERY_HEAVY: { min: 100, max: 200, color: '#1d4ed8', label: 'Rất to' },
  EXTREME: { min: 200, max: Infinity, color: '#1e3a8a', label: 'Cực đại' },
};

// Application Settings
export const APP_CONFIG = {
  NAME: 'KTTV Weather Dashboard',
  VERSION: '1.0.0',
  AUTHOR: 'KTTV Development Team',
  REFRESH_INTERVAL: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
};
