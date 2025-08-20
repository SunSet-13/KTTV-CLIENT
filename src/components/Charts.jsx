import React, { useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function Charts({ data, stations }) {
  const summaryChartRef = useRef(null);
  const timeSeriesChartRef = useRef(null);
  const summaryChartInstance = useRef(null);
  const timeSeriesChartInstance = useRef(null);

  const renderSummaryChart = useCallback(() => {
    if (!summaryChartRef.current || !data || data.length === 0) return;

    // Nhóm dữ liệu theo trạm
    const stationStats = {};
    data.forEach(item => {
      if (!stationStats[item.stationId]) {
        const station = stations.find(s => s.id === item.stationId);
        stationStats[item.stationId] = {
          name: station?.name || `Station ${item.stationId}`,
          sum: 0,
          count: 0,
          max: -Infinity,
          min: Infinity
        };
      }
      
      stationStats[item.stationId].sum += item.value;
      stationStats[item.stationId].count++;
      stationStats[item.stationId].max = Math.max(stationStats[item.stationId].max, item.value);
      stationStats[item.stationId].min = Math.min(stationStats[item.stationId].min, item.value);
    });

    const labels = Object.values(stationStats).map(s => s.name);
    const sums = Object.values(stationStats).map(s => s.sum);
    const avgs = Object.values(stationStats).map(s => s.sum / s.count);
    const maxs = Object.values(stationStats).map(s => s.max);
    const mins = Object.values(stationStats).map(s => s.min);

    if (summaryChartInstance.current) {
      summaryChartInstance.current.destroy();
    }

    const ctx = summaryChartRef.current.getContext('2d');
    summaryChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tổng lượng mưa (mm)',
            data: sums,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Lượng mưa TB (mm)',
            data: avgs,
            type: 'line',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            pointRadius: 4
          },
          {
            label: 'Lượng mưa lớn nhất (mm)',
            data: maxs,
            type: 'line',
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderWidth: 2,
            pointRadius: 4
          },
          {
            label: 'Lượng mưa nhỏ nhất (mm)',
            data: mins,
            type: 'line',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Lượng mưa (mm)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Trạm đo'
            }
          }
        }
      }
    });
  }, [data, stations]);

  const renderTimeSeriesChart = useCallback(() => {
    if (!timeSeriesChartRef.current || !data || data.length === 0) return;

    // Nhóm dữ liệu theo thời gian
    const timeData = {};
    data.forEach(item => {
      const timeKey = new Date(item.time).toISOString();
      if (!timeData[timeKey]) {
        timeData[timeKey] = {
          time: new Date(item.time),
          stations: {}
        };
      }
      timeData[timeKey].stations[item.stationId] = item.value;
    });

    const sortedTimes = Object.values(timeData).sort((a, b) => a.time - b.time);
    const stationIds = [...new Set(data.map(item => item.stationId))];

    const datasets = stationIds.map(stationId => {
      const station = stations.find(s => s.id === stationId);
      const chartData = sortedTimes.map(time => ({
        x: time.time.toLocaleDateString() + ' ' + time.time.toLocaleTimeString(),
        y: time.stations[stationId] || null
      }));

      return {
        label: station?.name || `Station ${stationId}`,
        data: chartData,
        borderColor: getRandomColor(),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      };
    });

    if (timeSeriesChartInstance.current) {
      timeSeriesChartInstance.current.destroy();
    }

    const ctx = timeSeriesChartRef.current.getContext('2d');
    timeSeriesChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: { datasets: datasets },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Thời gian'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Lượng mưa (mm)'
            }
          }
        }
      }
    });
  }, [data, stations]);

  useEffect(() => {
    if (data && data.length > 0) {
      renderSummaryChart();
      renderTimeSeriesChart();
    }

    return () => {
      if (summaryChartInstance.current) {
        summaryChartInstance.current.destroy();
      }
      if (timeSeriesChartInstance.current) {
        timeSeriesChartInstance.current.destroy();
      }
    };
  }, [data, stations, renderSummaryChart, renderTimeSeriesChart]);

  const getRandomColor = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`;
  };

  return (
    <div className="charts-container">
      <div className="chart-item">
        <h3>Biểu đồ tổng hợp</h3>
        <canvas ref={summaryChartRef} height="220"></canvas>
      </div>
      <div className="chart-item">
        <h3>Diễn biến theo thời gian</h3>
        <canvas ref={timeSeriesChartRef} height="220"></canvas>
      </div>
    </div>
  );
}

export default Charts;
