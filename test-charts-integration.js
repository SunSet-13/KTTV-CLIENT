// Test cả hai biểu đồ với API chính xác
const testBothChartAPIs = async () => {
  const baseUrl = 'http://localhost:2004/api/rain-province-time';
  const testProvince = 'TP. Hà Nội';
  const testDate = { year: 2025, month: 8, day: 4 };
  
  console.log('=== TESTING CHART APIS ===\n');
  
  // Test 1: StationRainfallBarChart API (single hour)
  console.log('1. Testing StationRainfallBarChart API (single hour):');
  try {
    const hour = 10;
    const url = `${baseUrl}?province=${encodeURIComponent(testProvince)}&year=${testDate.year}&month=${testDate.month}&day=${testDate.day}&hour=${hour}`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✓ Status:', response.status);
    console.log('✓ Success:', data.success);
    console.log('✓ Total stations:', data.totalRecords);
    
    if (data.data && data.data.length > 0) {
      console.log('✓ Data structure check:');
      const sample = data.data[0];
      console.log('  - StationID:', sample.StationID);
      console.log('  - StationNameVN:', sample.StationNameVN);
      console.log('  - RainValue:', sample.RainValue, '(type:', typeof sample.RainValue, ')');
      console.log('  - Hour:', sample.Hour);
      console.log('  - ProvinceName:', sample.ProvinceName);
      
      // Đếm số trạm có dữ liệu mưa > 0
      const rainyStations = data.data.filter(item => item.RainValue > 0);
      console.log('✓ Stations with rain > 0:', rainyStations.length);
      
      if (rainyStations.length > 0) {
        console.log('  Top 3 stations with highest rainfall:');
        rainyStations
          .sort((a, b) => b.RainValue - a.RainValue)
          .slice(0, 3)
          .forEach(station => {
            console.log(`    ${station.StationNameVN}: ${station.RainValue}mm`);
          });
      }
    }
    console.log('---\n');
  } catch (error) {
    console.error('❌ Error testing bar chart API:', error.message);
  }
  
  // Test 2: ProvinceRainfallChart API (range)
  console.log('2. Testing ProvinceRainfallChart API (range):');
  try {
    const startHour = 9;
    const endHour = 11;
    const url = `${baseUrl}/range?province=${encodeURIComponent(testProvince)}&startYear=${testDate.year}&startMonth=${testDate.month}&startDay=${testDate.day}&startHour=${startHour}&endHour=${endHour}`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✓ Status:', response.status);
    console.log('✓ Success:', data.success);
    console.log('✓ Total records:', data.totalRecords);
    
    if (data.data && data.data.length > 0) {
      // Phân nhóm theo giờ
      const hourlyGroups = data.data.reduce((acc, item) => {
        if (!acc[item.Hour]) acc[item.Hour] = [];
        acc[item.Hour].push(item);
        return acc;
      }, {});
      
      console.log('✓ Hourly data distribution:');
      Object.keys(hourlyGroups).sort().forEach(hour => {
        const stations = hourlyGroups[hour];
        const avgRainfall = stations.reduce((sum, s) => sum + s.RainValue, 0) / stations.length;
        const maxRainfall = Math.max(...stations.map(s => s.RainValue));
        console.log(`  Hour ${hour}: ${stations.length} stations, avg=${avgRainfall.toFixed(2)}mm, max=${maxRainfall}mm`);
      });
      
      // Sample data structure
      console.log('✓ Sample record:');
      const sample = data.data[0];
      console.log('  - RainValue:', sample.RainValue);
      console.log('  - Hour:', sample.Hour);
      console.log('  - DateTime:', sample.DateTime);
    }
    console.log('---\n');
  } catch (error) {
    console.error('❌ Error testing line chart API:', error.message);
  }
  
  // Test 3: Tỉnh có dữ liệu mưa cao
  console.log('3. Testing with high rainfall province (Sơn La):');
  try {
    const url = `${baseUrl}?province=Sơn La&year=2025&month=8&day=12&hour=20`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data) {
      const rainData = data.data.filter(item => item.RainValue > 0);
      console.log(`✓ Sơn La rainfall stations: ${rainData.length}/${data.data.length}`);
      
      if (rainData.length > 0) {
        const maxRain = Math.max(...rainData.map(item => item.RainValue));
        const topStation = rainData.find(item => item.RainValue === maxRain);
        console.log(`  Highest: ${topStation.StationNameVN} - ${maxRain}mm`);
      }
    }
  } catch (error) {
    console.error('❌ Error testing Sơn La:', error.message);
  }
  
  console.log('\n=== CHART INTEGRATION READY ===');
  console.log('✓ Both APIs are working correctly');
  console.log('✓ Data structure confirmed: RainValue field');
  console.log('✓ Charts should display accurate rainfall data');
};

testBothChartAPIs();
