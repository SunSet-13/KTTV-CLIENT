import { useRef, useCallback } from 'react';
import L from 'leaflet';
import { rainfallUtils } from '../../../shared/utils/rainfallUtils';
import { formatUtils, dateUtils } from '../../../shared/utils';

export const useMapInstance = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  // Initialize map
  const initializeMap = useCallback((center = [16.0, 108.0], zoom = 6) => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map instance
    mapInstance.current = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance.current);

    // Create markers group
    markersGroup.current = L.layerGroup().addTo(mapInstance.current);

    return mapInstance.current;
  }, []);

  // Create marker
  const createMarker = useCallback((station) => {
    const { latitude, longitude, rainValue, name, code, id, dateTime } = station;
    const color = rainfallUtils.getColorForRainfall(rainValue);
    const radius = rainfallUtils.getMarkerRadius(rainValue);
    
    const marker = L.circleMarker([latitude, longitude], {
      radius,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    // Hover effects
    marker.on('mouseover', () => marker.setStyle({ 
      fillOpacity: 1, weight: 3, radius: radius + 1 
    }));
    
    marker.on('mouseout', () => marker.setStyle({ 
      fillOpacity: 0.8, weight: 2, radius 
    }));
    
    // Popup
    const popupContent = `
      <div style="font-family: Arial, sans-serif; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #2E86AB;">${name}</h4>
        <p style="margin: 2px 0;"><strong>Mã trạm:</strong> ${code}</p>
        <p style="margin: 2px 0;"><strong>ID:</strong> ${id}</p>
        <p style="margin: 2px 0;"><strong>Tọa độ:</strong> ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
        <p style="margin: 2px 0;"><strong>Lượng mưa:</strong> 
          <span style="color: ${color}; font-weight: bold; font-size: 16px;">${formatUtils.formatNumber(rainValue)} mm</span>
        </p>
        <p style="margin: 2px 0; font-size: 12px; color: #666;"><strong>Thời gian:</strong> ${dateUtils.formatDateTime(dateTime)}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'custom-popup'
    });

    return marker;
  }, []);

  // Update markers
  const updateMarkers = useCallback((stations) => {
    if (!markersGroup.current) return;

    // Clear existing markers
    markersGroup.current.clearLayers();

    // Add new markers
    stations.forEach(station => {
      const marker = createMarker(station);
      markersGroup.current.addLayer(marker);
    });
  }, [createMarker]);

  // Update marker sizes based on zoom level
  const updateMarkerSizes = useCallback(() => {
    if (!markersGroup.current || !mapInstance.current) return;

    const zoom = mapInstance.current.getZoom();
    const scaleFactor = Math.max(0.5, Math.min(2, zoom / 10));

    markersGroup.current.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) {
        const originalRadius = layer.options.originalRadius || layer.getRadius();
        layer.setRadius(originalRadius * scaleFactor);
        layer.options.originalRadius = originalRadius;
      }
    });
  }, []);

  // Fit map to stations
  const fitToStations = useCallback((stations) => {
    if (!mapInstance.current || !stations.length) return;

    const group = new L.featureGroup();
    stations.forEach(station => {
      L.marker([station.latitude, station.longitude]).addTo(group);
    });

    mapInstance.current.fitBounds(group.getBounds(), { 
      padding: [20, 20],
      maxZoom: 12 
    });
  }, []);

  // Set map view
  const setMapView = useCallback((center, zoom) => {
    if (!mapInstance.current) return;
    mapInstance.current.setView(center, zoom);
  }, []);

  // Get map center
  const getMapCenter = useCallback(() => {
    if (!mapInstance.current) return null;
    return mapInstance.current.getCenter();
  }, []);

  // Get map zoom
  const getMapZoom = useCallback(() => {
    if (!mapInstance.current) return null;
    return mapInstance.current.getZoom();
  }, []);

  // Cleanup map
  const cleanupMap = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    markersGroup.current = null;
  }, []);

  return {
    mapRef,
    mapInstance: mapInstance.current,
    markersGroup: markersGroup.current,
    initializeMap,
    updateMarkers,
    updateMarkerSizes,
    fitToStations,
    setMapView,
    getMapCenter,
    getMapZoom,
    cleanupMap
  };
};
