// Test API chính xác mà user cung cấp
const testCorrectAPI = async () => {
  const baseUrl = 'http://localhost:2004/api';
  
  console.log('=== TESTING CORRECT API ENDPOINTS ===\n');
  
  // Test 1: Single hour API với Hà Nội
  try {
    console.log('1. Testing rain-province-time với Hà Nội:');
    const response = await fetch(`${baseUrl}/rain-province-time?province=TP. Hà Nội&year=2025&month=8&day=4&hour=10`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Province:', data.province);
    console.log('Total records:', data.totalRecords);
    console.log('Data length:', data.data?.length);
    
    if (data.data && data.data.length > 0) {
      console.log('\nSample station:');
      const sample = data.data[0];
      console.log(JSON.stringify(sample, null, 2));
      
      console.log('\nAll fields in first record:');
      Object.keys(sample).forEach(key => {
        console.log(`${key}: ${sample[key]} (${typeof sample[key]})`);
      });
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Test 2: Range API
  try {
    console.log('2. Testing rain-province-time/range với Hà Nội:');
    const response = await fetch(`${baseUrl}/rain-province-time/range?province=TP. Hà Nội&startYear=2025&startMonth=8&startDay=4&startHour=9&endHour=11`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Total records:', data.totalRecords);
    console.log('Data length:', data.data?.length);
    
    if (data.data && data.data.length > 0) {
      console.log('\nSample record:');
      const sample = data.data[0];
      console.log(JSON.stringify(sample, null, 2));
      
      // Phân tích dữ liệu theo giờ
      const hourGroups = {};
      data.data.forEach(item => {
        const hour = item.Hour;
        if (!hourGroups[hour]) hourGroups[hour] = 0;
        hourGroups[hour]++;
      });
      
      console.log('\nDistribution by hour:');
      Object.keys(hourGroups).sort().forEach(hour => {
        console.log(`Hour ${hour}: ${hourGroups[hour]} stations`);
      });
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error:', error);
  }
};

testCorrectAPI();
