import React from 'react';

function Legend() {
  const grades = [0, 1, 5, 10, 20, 30, 50];
  const colors = grades.map(getColorForRainfall);

  function getColorForRainfall(val) {
    return val > 50 ? '#800026' :
           val > 30 ? '#BD0026' :
           val > 20 ? '#E31A1C' :
           val > 10 ? '#FC4E2A' :
           val > 5 ? '#FD8D3C' :
           val > 1 ? '#FEB24C' :
           val > 0 ? '#FED976' : '#FFFFB2';
  }

  return (
    <div className="legend">
      <b>Chú giải</b>
      <div>
        {grades.map((grade, index) => {
          const from = grade;
          const to = grades[index + 1];
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
              <div
                style={{
                  background: colors[index],
                  display: 'inline-block',
                  width: '18px',
                  height: '12px',
                  marginRight: '4px'
                }}
              ></div>
              <span>{from}{to ? `–${to}` : '+'} mm</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Legend;
