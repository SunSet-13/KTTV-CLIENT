// Test API rain-province-time để xác định cấu trúc dữ liệu chính xác
const testRainProvinceTimeAPI = async () => {
  const baseUrl = 'http://localhost:2004/api';
  
  console.log('=== TESTING RAIN-PROVINCE-TIME API ===\n');
  
  // Test 1: API cơ bản với TP. Hà Nội
  try {
    console.log('1. Testing basic rain-province-time API:');
    const response = await fetch(`${baseUrl}/rain-province-time?province=TP. Hà Nội&year=2025&month=8&day=4&hour=10`);
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response structure:');
      console.log('- Keys:', Object.keys(data));
      console.log('- Success:', data.success);
      console.log('- Message:', data.message);
      console.log('- Province:', data.province);
      console.log('- Total Records:', data.totalRecords);
      console.log('- Data Length:', data.data?.length);
      
      if (data.data && data.data.length > 0) {
        console.log('\nFirst record analysis:');
        const firstRecord = data.data[0];
        console.log('Record keys:', Object.keys(firstRecord));
        console.log('Full record:');
        console.log(JSON.stringify(firstRecord, null, 2));
        
        // Tìm các trường có thể chứa giá trị lượng mưa
        console.log('\nPossible rain value fields:');
        Object.keys(firstRecord).forEach(key => {
          const value = firstRecord[key];
          if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
            console.log(`${key}: ${value} (${typeof value})`);
          }
        });
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing basic API:', error.message);
  }
  
  // Test 2: Range API
  try {
    console.log('2. Testing range API:');
    const response = await fetch(`${baseUrl}/rain-province-time/range?province=TP. Hà Nội&startYear=2025&startMonth=8&startDay=4&startHour=9&endHour=11`);
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Total Records:', data.totalRecords);
      console.log('Data Length:', data.data?.length);
      
      if (data.data && data.data.length > 0) {
        console.log('\nRange API - First record:');
        console.log(JSON.stringify(data.data[0], null, 2));
        
        // Phân tích dữ liệu theo giờ
        const hourDistribution = {};
        data.data.forEach(item => {
          const hour = item.Hour;
          if (!hourDistribution[hour]) hourDistribution[hour] = 0;
          hourDistribution[hour]++;
        });
        
        console.log('\nHour distribution:');
        Object.keys(hourDistribution).sort().forEach(hour => {
          console.log(`Hour ${hour}: ${hourDistribution[hour]} records`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing range API:', error.message);
  }
  
  // Test 3: Thử với tỉnh khác
  try {
    console.log('3. Testing with different province (Sơn La):');
    const response = await fetch(`${baseUrl}/rain-province-time?province=Sơn La&year=2025&month=8&day=12&hour=20`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Data Length:', data.data?.length);
      
      if (data.data && data.data.length > 0) {
        console.log('Sample record from Sơn La:');
        console.log(JSON.stringify(data.data[0], null, 2));
      }
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing Sơn La:', error.message);
  }
};

testRainProvinceTimeAPI();
