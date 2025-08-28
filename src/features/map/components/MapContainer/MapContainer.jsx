import React, { useEffect } from 'react';
import { useMapInstance } from '../../hooks/useMapInstance';
import MapLegend from '../MapLegend';
import 'leaflet/dist/leaflet.css';
import './MapContainer.css';

const MapContainer = ({ 
  stations = [], 
  center = [16.0, 108.0], 
  zoom = 6,
  onMapReady = () => {},
  showLegend = true 
}) => {
  const {
    mapRef,
    mapInstance,
    initializeMap,
    updateMarkers,
    fitToStations,
    cleanupMap
  } = useMapInstance();

  // Initialize map on mount
  useEffect(() => {
    const map = initializeMap(center, zoom);
    if (map) {
      onMapReady(map);
    }

    return () => {
      cleanupMap();
    };
  }, [initializeMap, center, zoom, onMapReady, cleanupMap]);

  // Update markers when stations change
  useEffect(() => {
    if (mapInstance && stations.length > 0) {
      updateMarkers(stations);
    }
  }, [mapInstance, stations, updateMarkers]);

  // Fit to stations when they change
  useEffect(() => {
    if (mapInstance && stations.length > 0) {
      fitToStations(stations);
    }
  }, [mapInstance, stations, fitToStations]);

  return (
    <div className="map-container">
      <div 
        ref={mapRef} 
        className="leaflet-map"
        style={{ height: '100%', width: '100%' }}
      />
      
      {showLegend && <MapLegend isVisible={true} />}
      
      {stations.length === 0 && (
        <div className="map-overlay">
          <div className="no-data-message">
            <p>Không có dữ liệu trạm để hiển thị</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
