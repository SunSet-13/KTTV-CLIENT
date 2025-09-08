// Test API endpoints để verify cấu trúc dữ liệu
const testAPIs = async () => {
  const baseUrl = 'http://localhost:2004/api';
  
  console.log('=== TESTING API ENDPOINTS ===\n');
  
  // Test 1: Provinces API
  try {
    console.log('1. Testing /provinces');
    const response = await fetch(`${baseUrl}/provinces`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response structure:', JSON.stringify(data, null, 2));
    console.log('---\n');
  } catch (error) {
    console.error('Error testing provinces:', error);
  }
  
  // Test 2: Rain Province Time API với Sơn La
  try {
    console.log('2. Testing /rain-province-time (Sơn La)');
    const response = await fetch(`${baseUrl}/rain-province-time?province=Sơn La&year=2025&month=8&day=12&hour=20`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response keys:', Object.keys(data));
    console.log('Success:', data.success);
    console.log('Total records:', data.totalRecords);
    console.log('Data length:', data.data?.length);
    
    if (data.data && data.data.length > 0) {
      console.log('Sample station data:');
      console.log(JSON.stringify(data.data[0], null, 2));
      
      // Kiểm tra tất cả các trường dữ liệu
      const firstStation = data.data[0];
      console.log('\nData fields analysis:');
      console.log('- StationName:', firstStation.StationName);
      console.log('- StationNameVN:', firstStation.StationNameVN);
      console.log('- Value:', firstStation.Value);
      console.log('- Latitude:', firstStation.Latitude);
      console.log('- Longitude:', firstStation.Longitude);
      console.log('- ProvinceName:', firstStation.ProvinceName);
      console.log('- Year/Month/Day/Hour:', firstStation.Year, firstStation.Month, firstStation.Day, firstStation.Hour);
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing rain-province-time:', error);
  }
  
  // Test 3: Try with different province
  try {
    console.log('3. Testing /rain-province-time (Hà Nội)');
    const response = await fetch(`${baseUrl}/rain-province-time?province=Hà Nội&year=2025&month=8&day=12&hour=20`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Data length:', data.data?.length);
    console.log('---\n');
  } catch (error) {
    console.error('Error testing rain-province-time Hà Nội:', error);
  }
  
  // Test 4: Range API
  try {
    console.log('4. Testing /rain-province-time/range');
    const response = await fetch(`${baseUrl}/rain-province-time/range?province=Sơn La&startYear=2025&startMonth=8&startDay=12&endDay=12`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Data length:', data.data?.length);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing range API:', error);
  }
};

testAPIs().catch(console.error);
