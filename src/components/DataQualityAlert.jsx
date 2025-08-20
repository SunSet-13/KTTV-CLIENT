import React from 'react';

function DataQualityAlert({ report }) {
  if (!report || (report.missingDataStations?.length === 0 && report.invalidDataCount === 0)) {
    return null;
  }

  return (
    <div className="data-quality-alert">
      <p><strong>Tổng số bản ghi:</strong> {report.totalRecords}</p>
      <p><strong>Dữ liệu thiếu:</strong> {report.missingDataCount} bản ghi</p>
      <p><strong>Dữ liệu không hợp lệ:</strong> {report.invalidDataCount} bản ghi</p>
      {report.missingDataStations?.length > 0 && (
        <p><strong>Trạm có dữ liệu thiếu:</strong> {report.missingDataStations.join(', ')}</p>
      )}
    </div>
  );
}

export default DataQualityAlert;
