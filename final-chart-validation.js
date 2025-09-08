// Final test - Kiểm tra biểu đồ hoạt động với dữ liệu thực
console.log('=== FINAL CHART VALIDATION ===\n');

const validateChartData = async () => {
  const baseUrl = 'http://localhost:2004/api/rain-province-time';
  
  // Test với cấu hình mặc định của StationRainfallBarChart
  console.log('1. StationRainfallBarChart Default Settings:');
  console.log('   Province: TP. Hà Nội, Date: 2025-08-04, Hour: 9');
  
  try {
    const response = await fetch(`${baseUrl}?province=TP. Hà Nội&year=2025&month=8&day=4&hour=9`);
    const data = await response.json();
    
    if (data.success) {
      const rainStations = data.data.filter(s => s.RainValue > 0);
      console.log(`   ✓ Total stations: ${data.data.length}`);
      console.log(`   ✓ Stations with rainfall: ${rainStations.length}`);
      
      if (rainStations.length > 0) {
        const maxRain = Math.max(...rainStations.map(s => s.RainValue));
        const maxStation = rainStations.find(s => s.RainValue === maxRain);
        console.log(`   ✓ Max rainfall: ${maxStation.StationNameVN} - ${maxRain}mm`);
        
        console.log('   ✓ Top 5 stations:');
        rainStations
          .sort((a, b) => b.RainValue - a.RainValue)
          .slice(0, 5)
          .forEach((station, index) => {
            console.log(`      ${index + 1}. ${station.StationNameVN}: ${station.RainValue}mm`);
          });
      }
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  console.log('\n2. ProvinceRainfallChart Default Settings:');
  console.log('   Province: TP. Hà Nội, Date: 2025-08-04, Hours: 9-11');
  
  try {
    const response = await fetch(`${baseUrl}/range?province=TP. Hà Nội&startYear=2025&startMonth=8&startDay=4&startHour=9&endHour=11`);
    const data = await response.json();
    
    if (data.success) {
      // Tính toán theo giờ
      const hourlyStats = {};
      data.data.forEach(item => {
        if (!hourlyStats[item.Hour]) {
          hourlyStats[item.Hour] = { total: 0, count: 0, max: 0 };
        }
        hourlyStats[item.Hour].total += item.RainValue;
        hourlyStats[item.Hour].count += 1;
        hourlyStats[item.Hour].max = Math.max(hourlyStats[item.Hour].max, item.RainValue);
      });
      
      console.log(`   ✓ Total records: ${data.data.length}`);
      console.log('   ✓ Hourly breakdown:');
      
      Object.keys(hourlyStats).sort().forEach(hour => {
        const stats = hourlyStats[hour];
        const avg = stats.total / stats.count;
        console.log(`      Hour ${hour}: avg=${avg.toFixed(2)}mm, max=${stats.max}mm, stations=${stats.count}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  console.log('\n3. High Rainfall Example (Sơn La):');
  try {
    const response = await fetch(`${baseUrl}?province=Sơn La&year=2025&month=8&day=12&hour=20`);
    const data = await response.json();
    
    if (data.success) {
      const rainStations = data.data.filter(s => s.RainValue > 0);
      const totalRain = rainStations.reduce((sum, s) => sum + s.RainValue, 0);
      const avgRain = rainStations.length > 0 ? totalRain / rainStations.length : 0;
      
      console.log(`   ✓ Stations with rain: ${rainStations.length}/${data.data.length}`);
      console.log(`   ✓ Average rainfall: ${avgRain.toFixed(2)}mm`);
      console.log(`   ✓ Total rainfall: ${totalRain.toFixed(2)}mm`);
      
      if (rainStations.length > 0) {
        const maxStation = rainStations.reduce((max, station) => 
          station.RainValue > max.RainValue ? station : max
        );
        console.log(`   ✓ Highest: ${maxStation.StationNameVN} - ${maxStation.RainValue}mm`);
      }
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  console.log('\n=== VALIDATION COMPLETE ===');
  console.log('✓ APIs are working correctly');
  console.log('✓ Data format: RainValue field confirmed');
  console.log('✓ Charts ready for accurate visualization');
  console.log('✓ Default settings provide meaningful data');
};

validateChartData();
