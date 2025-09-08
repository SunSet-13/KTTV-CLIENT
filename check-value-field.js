// Test API chi tiết để tìm trường Value
const testValueField = async () => {
  try {
    const response = await fetch('http://localhost:2004/api/rain-province-time?province=Sơn La&year=2025&month=8&day=12&hour=20');
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('Tất cả các trường trong record đầu tiên:');
      const firstRecord = data.data[0];
      Object.keys(firstRecord).forEach(key => {
        console.log(`${key}: ${firstRecord[key]} (${typeof firstRecord[key]})`);
      });
      
      console.log('\n--- Checking multiple records for value fields ---');
      data.data.slice(0, 5).forEach((record, index) => {
        console.log(`Record ${index + 1}:`, record.StationNameVN);
        Object.keys(record).forEach(key => {
          if (key.toLowerCase().includes('value') || key.toLowerCase().includes('rain')) {
            console.log(`  ${key}: ${record[key]}`);
          }
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testValueField();
