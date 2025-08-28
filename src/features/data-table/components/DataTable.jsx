import React, { useState, useEffect } from 'react';
import './DataTable.css';
import { Header } from '../../../layouts';

function DataTable({ onGoBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('id'); // 'id' hoặc 'name'
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(''); // Từ khóa đã được áp dụng
  const [appliedSearchType, setAppliedSearchType] = useState('id'); // Loại tìm kiếm đã được áp dụng
  
  const recordsPerPage = 50;

  useEffect(() => {
    loadData();
  }, [currentPage, appliedSearchTerm, appliedSearchType]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tạo query parameters - API hiện tại không hỗ trợ pagination
      const params = new URLSearchParams();
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
        params.append('searchType', appliedSearchType);
      }

      const response = await fetch(`http://localhost:2004/api/station-data${params.toString() ? '?' + params.toString() : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result); // Debug log
      
      // API trả về { stationData: [...] }
      const stationData = result.stationData || result.data || result || [];
      
      // Lọc dữ liệu ở client side nếu có tìm kiếm
      let filteredData = stationData;
      if (appliedSearchTerm) {
        filteredData = stationData.filter(item => {
          if (appliedSearchType === 'id') {
            return item.StationID.toString().includes(appliedSearchTerm);
          } else if (appliedSearchType === 'name') {
            return item.StationNameVN.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
                   item.StationName.toLowerCase().includes(appliedSearchTerm.toLowerCase());
          } else { // address
            return item.Address.toLowerCase().includes(appliedSearchTerm.toLowerCase());
          }
        });
      }
      
      // Pagination ở client side
      const totalRecords = filteredData.length;
      const totalPages = Math.ceil(totalRecords / recordsPerPage);
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const pageData = filteredData.slice(startIndex, endIndex);
      
      setData(pageData);
      setTotalPages(totalPages);
      setTotalRecords(totalRecords);
      
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ API:', error);
      setError(`Không thể kết nối đến API: ${error.message}`);
      
      // Dữ liệu mẫu khi không có API
      const mockData = generateMockData(currentPage, appliedSearchTerm, appliedSearchType);
      setData(mockData.data);
      setTotalPages(mockData.totalPages);
      setTotalRecords(mockData.totalRecords);
      
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (page, search, type) => {
    // Tạo dữ liệu mẫu theo cấu trúc API thực
    const allData = [];
    for (let i = 1; i <= 1000; i++) {
      allData.push({
        StationID: 100000 + i,
        StationName: `Station ${i}`,
        StationNameVN: `Trạm ${i}`,
        Latitude: parseFloat((10 + Math.random() * 12).toFixed(6)),
        Longitude: parseFloat((100 + Math.random() * 10).toFixed(6)),
        ProvinceID: Math.floor(Math.random() * 63) + 1,
        Status: Math.random() > 0.1, // 90% active
        RegID: Math.floor(Math.random() * 3) + 1,
        Address: `Địa chỉ trạm ${i}, Tỉnh ${Math.floor(Math.random() * 63) + 1}`,
        Project: 10
      });
    }

    // Lọc dữ liệu theo tìm kiếm
    let filteredData = allData;
    if (search) {
      filteredData = allData.filter(item => {
        if (type === 'id') {
          return item.StationID.toString().includes(search);
        } else if (type === 'name') {
          return item.StationNameVN.toLowerCase().includes(search.toLowerCase()) ||
                 item.StationName.toLowerCase().includes(search.toLowerCase());
        } else { // address
          return item.Address.toLowerCase().includes(search.toLowerCase());
        }
      });
    }

    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    return {
      data: pageData,
      totalPages,
      totalRecords
    };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearchTerm(searchTerm);
    setAppliedSearchType(searchType);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          ««
        </button>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          »»
        </button>
      </div>
    );
  };

  return (
    <div className="data-table-page">
      <Header />
      <div className="data-header">
        <h2>Truy xuất dữ liệu khí tượng thủy văn</h2>
        <button onClick={onGoBack} className="back-button">← Quay lại</button>
      </div>

      <div className="api-info">
        <i className="fas fa-info-circle"></i> 
        <strong> Nguồn dữ liệu:</strong> API http://localhost:2004/api/station-data
        {error && <span className="api-error-note"> (Hiện tại sử dụng dữ liệu mẫu do API không khả dụng)</span>}
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="search-type-select"
            >
              <option value="id">Tìm theo ID trạm</option>
              <option value="name">Tìm theo tên trạm</option>
              <option value="address">Tìm theo địa chỉ</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder={
                searchType === 'id' ? 'Nhập ID trạm (VD: 100101)...' : 
                searchType === 'name' ? 'Nhập tên trạm...' : 
                'Nhập địa chỉ...'
              }
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i> Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setAppliedSearchTerm('');
                setAppliedSearchType('id');
                setSearchType('id');
                setCurrentPage(1);
              }}
              className="clear-btn"
            >
              <i className="fas fa-times"></i> Xóa
            </button>
          </div>
        </form>
      </div>

      <div className="data-info">
        <p>
          Hiển thị {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, totalRecords)} 
          trong tổng số {totalRecords} bản ghi
          {appliedSearchTerm && (
            <span className="search-status">
              {' '}- Đang lọc: "{appliedSearchTerm}" (
              {appliedSearchType === 'id' ? 'theo ID trạm' : 
               appliedSearchType === 'name' ? 'theo tên trạm' : 
               'theo địa chỉ'})
            </span>
          )}
          {error && (
            <span className="search-status" style={{ color: '#f39c12' }}>
              {' '}- Sử dụng dữ liệu mẫu (API không khả dụng)
            </span>
          )}
        </p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">❌ Lỗi: {error}</p>
          <button onClick={loadData} className="retry-btn">Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Trạm</th>
                  <th>Tên trạm (VN)</th>
                  <th>Tên trạm (EN)</th>
                  <th>Vĩ độ</th>
                  <th>Kinh độ</th>
                  <th>Mã tỉnh</th>
                  <th>Trạng thái</th>
                  <th>Mã vùng</th>
                  <th>Địa chỉ</th>
                  <th>Dự án</th>
                </tr>
              </thead>
              <tbody>
                {data.map((record, index) => (
                  <tr key={record.StationID || index}>
                    <td>{record.StationID || 'N/A'}</td>
                    <td>{record.StationNameVN || 'N/A'}</td>
                    <td>{record.StationName || 'N/A'}</td>
                    <td>{typeof record.Latitude === 'number' ? record.Latitude.toFixed(6) : record.Latitude || 'N/A'}</td>
                    <td>{typeof record.Longitude === 'number' ? record.Longitude.toFixed(6) : record.Longitude || 'N/A'}</td>
                    <td>{record.ProvinceID || 'N/A'}</td>
                    <td>
                      <span className={`status ${record.Status ? 'active' : 'inactive'}`}>
                        {record.Status ? '✓ Hoạt động' : '✗ Ngừng'}
                      </span>
                    </td>
                    <td>{record.RegID || 'N/A'}</td>
                    <td title={record.Address}>{record.Address ? record.Address.substring(0, 50) + (record.Address.length > 50 ? '...' : '') : 'N/A'}</td>
                    <td>{record.Project || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default DataTable;
