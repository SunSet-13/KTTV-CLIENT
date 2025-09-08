// Test API khác để tìm dữ liệu lượng mưa
const testOtherAPIs = async () => {
  const baseUrl = 'http://localhost:2004/api';
  
  // Test rain-time API (không theo tỉnh)
  try {
    console.log('Testing /rain-time API:');
    const response = await fetch(`${baseUrl}/rain-time?year=2025&month=8&day=12&hour=20`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Total records:', data.totalRecords);
    
    if (data.data && data.data.length > 0) {
      console.log('Sample record:');
      const firstRecord = data.data[0];
      console.log(JSON.stringify(firstRecord, null, 2));
      
      console.log('\nAll fields:');
      Object.keys(firstRecord).forEach(key => {
        console.log(`${key}: ${firstRecord[key]} (${typeof firstRecord[key]})`);
      });
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing rain-time:', error);
  }
  
  // Test station-rain API
  try {
    console.log('Testing /station-rain API:');
    const response = await fetch(`${baseUrl}/station-rain`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Data keys:', Object.keys(data));
    
    if (data.data && data.data.length > 0) {
      console.log('Sample record:');
      const firstRecord = data.data[0];
      console.log(JSON.stringify(firstRecord, null, 2));
    }
    console.log('---\n');
  } catch (error) {
    console.error('Error testing station-rain:', error);
  }
};

testOtherAPIs();
