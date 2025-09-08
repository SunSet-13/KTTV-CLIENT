import React, { useState } from 'react';
import './App.css';

// Import layouts
import { Header, Footer } from './layouts';
// import ErrorBoundary from './ErrorBoundary.jsx'; // Tạm tắt

// Import features từng cái một để test

import ChartsPage_Simple from './features/charts/pages/ChartsPage_Simple.jsx';
import { DataTable } from './features/data-table';
import MapPageKTTV_Modular from './features/map/pages/MapPageKTTV_Modular.jsx';
import HomePage from './pages/HomePage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  console.log('🚀 App starting..., currentPage:', currentPage);
  
  // Navigation functions
  const navigateToHome = () => setCurrentPage('home');
  const navigateToCharts = () => setCurrentPage('charts');
  const navigateToDataTable = () => setCurrentPage('dataTable');
  const navigateToKTTVMap = () => setCurrentPage('kttvMap');

  // HomePage
  if (currentPage === 'home') {
    return (
      <div>
        <Header 
          onKTTVMapClick={navigateToKTTVMap}
          onDataTableClick={navigateToDataTable}
          onChartsClick={navigateToCharts}
          onHomeClick={navigateToHome}
        />
        <HomePage onNavigate={setCurrentPage} />
        <Footer />
      </div>
    );
  }

  // ChartsPage - Test đơn giản
  if (currentPage === 'charts') {
    return (
      <div>
        <Header 
          onKTTVMapClick={navigateToKTTVMap}
          onDataTableClick={navigateToDataTable}
          onChartsClick={navigateToCharts}
          onHomeClick={navigateToHome}
        />
        <ChartsPage_Simple onGoBack={navigateToHome} />
        <Footer />
      </div>
    );
  }

  // DataTable
  if (currentPage === 'dataTable') {
    return (
      <div>
        <Header 
          onKTTVMapClick={navigateToKTTVMap}
          onDataTableClick={navigateToDataTable}
          onChartsClick={navigateToCharts}
          onHomeClick={navigateToHome}
        />
        <DataTable onGoBack={navigateToHome} />
        <Footer />
      </div>
    );
  }

  // Map - Khôi phục đầy đủ chức năng
  if (currentPage === 'kttvMap') {
    return <MapPageKTTV_Modular />;
  }

  // Default
  return (
    <div>
      <Header 
        onKTTVMapClick={navigateToKTTVMap}
        onDataTableClick={navigateToDataTable}
        onChartsClick={navigateToCharts}
        onHomeClick={navigateToHome}
      />
      <HomePage onNavigate={setCurrentPage} />
      <Footer />
    </div>
  );
}

export default App;
